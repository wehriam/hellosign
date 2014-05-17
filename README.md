HelloSign
=========

A HelloSign API wrapper for Node.js. See the API documentation at https://www.hellosign.com/api/reference

**Installation**

```npm install hellosign```

**Testing**

Get an API key from your settings page: https://www.hellosign.com/home/myAccount#api

Copy config.json.sample to config.json and update the file with your account settings.

```
npm i -g mocha
npm test
```

**Usage**

The module wraps the api and returns [when.js](https://github.com/cujojs/when "A solid, fast Promises/A+ and when() implementation, plus other async goodies.") promises.

```
var fs = require("fs");
var path = require("path");
var HelloSign = require('hellosign');

var test_mode = true;
var signature_request = new HelloSign.SignatureRequest("YOUR_API_KEY_HERE", test_mode);

var example_file = fs.createReadStream(path.join(__dirname, './files/example.pdf'));
var options = {
  title: "Example Title",
  file:[example_file],
  signers:[
    {
      name: "Example User", 
      email_address: "user@example.com", 
    }
  ]
};
signature_request.send(options).done(function(result){
  console.log("Signature request " + result.signature_request.signature_request_id + " sent");
});

```

**Todo**

Extend test coverage.
