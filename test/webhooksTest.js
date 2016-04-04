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
    it('Should respond to check webhook', () => {
        const notification = sample(braintree.WebhookNotification.Kind.Check);
        const action = sinon.spy();
        const res = { send: sinon.spy() };
        const next = sinon.spy();
        const middleware = webhooks(gateway, { check: action });

        middleware({ body: notification }, res, next);

        sinon.assert.calledOnce(action);
        sinon.assert.calledOnce(res.send);
        sinon.assert.notCalled(next);

        assert.equal(
            action.getCall(0).args[0].kind,
            braintree.WebhookNotification.Kind.Check
        );
    });

    it('Should respond to subscription successful webhook', () => {
        const notification = sample(
            braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully,
            10
        );
        const action = sinon.spy();
        const res = { send: sinon.spy() };
        const next = sinon.spy();
        const middleware = webhooks(gateway, { subscription_charged_successfully: action });

        middleware({ body: notification }, res, next);

        sinon.assert.calledOnce(action);
        sinon.assert.calledOnce(res.send);
        sinon.assert.notCalled(next);

        assert.equal(
            action.getCall(0).args[0].kind,
            braintree.WebhookNotification.Kind.SubscriptionChargedSuccessfully
        );

        assert.equal(
            action.getCall(0).args[0].subscription.id,
            10
        );
    });


    it('Should respond with next no error', () => {
        const notification = sample(braintree.WebhookNotification.Kind.Check);
        const res = { send: sinon.spy() };
        const next = sinon.spy();
        const middleware = webhooks(gateway, {});

        middleware({ body: notification }, res, next);

        sinon.assert.notCalled(res.send);
        sinon.assert.calledOnce(next);

        assert.equal(
            next.getCall(0).args[0].message,
            'Unknown webhook'
        );
    });

    it('Should handle exception inside action code and pass it to next', () => {
        const notification = sample(braintree.WebhookNotification.Kind.Check);
        const action = sinon.spy(() => {
            throw new Error('Some test error');
        });
        const res = { send: sinon.spy() };
        const next = sinon.spy();
        const middleware = webhooks(gateway, { check: action });

        middleware({ body: notification }, res, next);

        sinon.assert.calledOnce(action);
        sinon.assert.notCalled(res.send);
        sinon.assert.calledOnce(next);

        assert.equal(
            next.getCall(0).args[0].message,
            'Some test error'
        );
    });

    it('Should call next on braintree error', () => {
        const action = sinon.spy();
        const res = { send: sinon.spy() };
        const next = sinon.spy();
        const middleware = webhooks(gateway, { check: action });

        middleware({ body: { bt_signature: 'asd', bt_payload: 'asd' } }, res, next);

        sinon.assert.notCalled(action);
        sinon.assert.notCalled(res.send);
        sinon.assert.calledOnce(next);
    });
});
