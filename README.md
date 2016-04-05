# express-braintree-webhooks
[![Build Status](https://secure.travis-ci.org/enhancv/express-braintree-webhooks.png?branch=master)](http://travis-ci.org/enhancv/express-braintree-webhooks)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/51878932d920453d87bd1e8600595542)](https://www.codacy.com/app/ivank/express-braintree-webhooks)
[![Codacy Badge](https://api.codacy.com/project/badge/coverage/51878932d920453d87bd1e8600595542)](https://www.codacy.com/app/ivank/express-braintree-webhooks)

Braintree webhooks middleware for express.js

## Getting Started
Install the module with: `npm install express-braintree-webhooks`

```javascript
var webhooks = require('express-braintree-webhooks');
var gateway = braintree.connect({ ... });

app.post(
    'secret path to webhook',
    webhooks(
        gateway,
        {
            check: function (notification) {
                console.log('braintree check');
            },
            subscription_charged_successfully: function (notification) {
                console.log('make it rain! ', notification.subscription.id);
            },
        }
    )
);
```

## Documantation
`webhooks(gateway, webhookResponses)`

| Item             | Description                                                   |
| -----------------|---------------------------------------------------------------|
| gateway          | [braintree gateway][1]                                        |
| webhookResponses | An object with [kind][2] as key and response as value         |
| returns          | a method to be passed as express middleware                   |

[1]: https://github.com/braintree/braintree_node
[2]: https://developers.braintreepayments.com/reference/general/webhooks/overview

This middleware does not provide a default url so you'll need to set it up yourself, as this usually involves adding a secret URL

## License
Copyright (c) 2016 Enhancv
Licensed under the MIT license.
