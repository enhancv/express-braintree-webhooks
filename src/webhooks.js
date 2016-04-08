/*
 * express-braintree-webhooks
 * https://github.com/enhancv/express-braintree-webhooks
 *
 * Copyright (c) 2016 Enhancv
 * Licensed under the MIT license.
 */
module.exports = function webhooks(gateway, kinds) {
    return function action(req, res, next) {
        gateway.webhookNotification.parse(
            req.body.bt_signature,
            req.body.bt_payload,
            (err, notification) => {
                if (err) {
                    return next(new Error(err));
                }

                if (kinds[notification.kind] === undefined) {
                    return next(new Error('Unknown webhook'));
                }

                try {
                    const promise = kinds[notification.kind](notification);

                    if (promise) {
                        promise.then(() => res.sendStatus(200), (error) => next(error));
                    } else {
                        return res.sendStatus(200);
                    }
                } catch (error) {
                    return next(error);
                }
            }
        );
    };
};
