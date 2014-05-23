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
signature_request.send(options).then(function(result){
  var signature_request_id = result.signature_request.signature_request_id;
  console.log("Signature request " + signature_request_id + " sent");
  return signature_request.files({file_type:"pdf", signature_request_id:signature_request_id});
}).then(function(stream){
  var example_pdf_stream = fs.createWriteStream(path.join(__dirname, './files/example-out.pdf'));
  stream.pipe(example_pdf_stream);
  example_pdf_stream.on("finish", function(){
    console.log("Example PDF output downloaded.");
  });
});

```
**Supported Methods**

Account ([API Documentation](https://www.hellosign.com/api/reference#Account))

 * Account::get(parameters)
 * Account::post(parameters)
 * Account::create(parameters)
 * Account::verify(parameters)

SignatureRequest ([API Documentation](https://www.hellosign.com/api/reference#SignatureRequest))

 * SignatureRequest::get(parameters)
 * SignatureRequest::list(parameters)
 * SignatureRequest::send(parameters)
 * SignatureRequest::send_with_template(parameters)
 * SignatureRequest::remind(parameters)
 * SignatureRequest::cancel(parameters)
 * SignatureRequest::create_embedded(parameters)
 * SignatureRequest::create_embedded_with_template(parameters)
 * SignatureRequest::files(parameters)

Template ([API Documentation](https://www.hellosign.com/api/reference#Template))

 * Template::get(parameters)
 * Template::list(parameters)
 * Template::add_user(parameters)
 * Template::remove_user(parameters)

Team ([API Documentation](https://www.hellosign.com/api/reference#Team))

 * Team::get(parameters)
 * Team::post(parameters)
 * Team::create(parameters)
 * Team::destroy(parameters)
 * Team::add_member(parameters)
 * Team::remove_member(parameters)

UnclaimedDraft ([API Documentation](https://www.hellosign.com/api/reference#UnclaimedDraft))

 * UnclaimedDraft::create(parameters)
 * UnclaimedDraft::create_embedded(parameters)

Embedded ([API Documentation](https://www.hellosign.com/api/reference#Embedded))

 * Embedded::get(parameters)

**Todo**

Extend test coverage, extend documentation.
