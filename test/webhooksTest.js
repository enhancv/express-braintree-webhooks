const sinon = require('sinon');
const assert = require('chai').assert;
const braintree = require('braintree');
const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const sample = function sample(kind, id) {
    return gateway.webhookTesting.sampleNotification(kind, id);
};
const webhooks = require('../src/webhooks');

describe('Webhooks middleware', () => {
    beforeEach(() => {
        this.action = sinon.spy();
        this.res = { sendStatus: sinon.spy() };
        this.next = sinon.spy();
        this.notification = sample(braintree.WebhookNotification.Kind.Check);
    });

    it('Should respond to check webhook', () => {
        const middleware = webhooks(gateway, { check: this.action });

        middleware({ body: this.notification }, this.res, this.next);

        sinon.assert.calledOnce(this.action);
        sinon.assert.calledOnce(this.res.sendStatus);
        sinon.assert.notCalled(this.next);

        assert.equal(
            this.action.getCall(0).args[0].kind,
            braintree.WebhookNotification.Kind.Check
        );
    });


    it('Should pass additional arguments directly', () => {
        const test1 = { test1: 'test1' };
        const middleware = webhooks(gateway, { check: this.action }, test1);

        middleware({ body: this.notification }, this.res, this.next);

        sinon.assert.calledOnce(this.action);
        sinon.assert.calledOnce(this.res.sendStatus);
        sinon.assert.notCalled(this.next);

        assert.equal(this.action.getCall(0).args[1], test1);
    });

    it('Should be able to handle promise resolution', () => {
        this.action = sinon.spy(() => new Promise((resolve) => resolve(true)));
        const middleware = webhooks(gateway, { check: this.action });

        middleware({ body: this.notification }, this.res, this.next);
        setTimeout(() => {
            sinon.assert.calledOnce(this.action);
            sinon.assert.calledOnce(this.res.sendStatus);
            sinon.assert.notCalled(this.next);
        }, 10);
    });

    it('Should be able to handle promise rejection', () => {
        this.action = sinon.spy(() => new Promise((resolve, reject) => reject(true)));
        const middleware = webhooks(gateway, { check: this.action });

        middleware({ body: this.notification }, this.res, this.next);

        setTimeout(() => {
            sinon.assert.calledOnce(this.action);
            sinon.assert.notCalled(this.res.sendStatus);
            sinon.assert.calledOnce(this.next);
        }, 10);
    });

    it('Should respond to subscription successful webhook', () => {
        this.notification = sample(
            braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully,
            10
        );
        const middleware = webhooks(gateway, { subscription_charged_successfully: this.action });

        middleware({ body: this.notification }, this.res, this.next);

        sinon.assert.calledOnce(this.action);
        sinon.assert.calledOnce(this.res.sendStatus);
        sinon.assert.notCalled(this.next);

        assert.equal(
            this.action.getCall(0).args[0].kind,
            braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully
        );

        assert.equal(
            this.action.getCall(0).args[0].subscription.id,
            10
        );
    });

    it('Should respond with next no error', () => {
        const middleware = webhooks(gateway, {});

        middleware({ body: this.notification }, this.res, this.next);

        sinon.assert.notCalled(this.res.sendStatus);
        sinon.assert.calledOnce(this.next);

        assert.equal(
            this.next.getCall(0).args[0].message,
            'Unknown webhook'
        );
    });

    it('Should handle exception inside action code and pass it to next', () => {
        this.action = sinon.spy(() => {
            throw new Error('Some test error');
        });
        const middleware = webhooks(gateway, { check: this.action });

        middleware({ body: this.notification }, this.res, this.next);

        sinon.assert.calledOnce(this.action);
        sinon.assert.notCalled(this.res.sendStatus);
        sinon.assert.calledOnce(this.next);

        assert.equal(
            this.next.getCall(0).args[0].message,
            'Some test error'
        );
    });

    it('Should call next on braintree error', () => {
        const middleware = webhooks(gateway, { check: this.action });

        middleware({ body: { bt_signature: 'asd', bt_payload: 'asd' } }, this.res, this.next);

        sinon.assert.notCalled(this.action);
        sinon.assert.notCalled(this.res.sendStatus);
        sinon.assert.calledOnce(this.next);
    });
});
