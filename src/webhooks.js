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
                    kinds[notification.kind](notification);
                } catch (error) {
                    return next(error);
                }

                return res.send(200);
            }
        );
    };
};
