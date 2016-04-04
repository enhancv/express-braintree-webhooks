# express-braintree-webhooks [![Build Status](https://secure.travis-ci.org/enhancv/express-braintree-webhooks.png?branch=master)](http://travis-ci.org/enhancv/express-braintree-webhooks)

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

## License
Copyright (c) 2016 Enhancv
Licensed under the MIT license.
