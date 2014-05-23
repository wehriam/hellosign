var assert = require('assert');
var config = require("../config.json");
var HelloSign = require("../lib/hellosign.js");
var UUID = require("node-uuid");
var fs = require("fs");
var when = require("when");
var path = require("path");

describe('HelloSign SignatureRequest', function () {
  this.timeout(60000);
  it('should send a signature request for multiple files.', function (done) {
    var signature_request = new HelloSign.SignatureRequest(config.hellosign_api_key, true);
    var signer_email_1 = UUID.v1().replace(/-/g, '') + "@example.com";
    var signer_email_2 = UUID.v1().replace(/-/g, '') + "@example.com";
    var signer_name_1 = UUID.v1().replace(/-/g, '');
    var signer_name_2 = UUID.v1().replace(/-/g, '');
    var sample_file_1 = fs.createReadStream(path.join(__dirname, './files/sample1.pdf'));
    var sample_file_2 = fs.createReadStream(path.join(__dirname, './files/sample2.pdf'));
    var options = {
      title: UUID.v1().replace(/-/g, ''),
      file: [sample_file_1, sample_file_2],
      signers: [{
        name: signer_name_1,
        email_address: signer_email_1
      }, {
        name: signer_name_2,
        email_address: signer_email_2
      }]
    };
    var signature_request_id;
    signature_request.send(options).then(function (result) {
      assert.equal(result.signature_request.title, options.title);
      signature_request_id = result.signature_request.signature_request_id;
      return signature_request.get({
        signature_request_id: signature_request_id
      });
    }).then(function (result) {
      assert.equal(result.signature_request.title, options.title);
      return signature_request.list();
    }).then(function (result) {
      assert.equal(result.signature_requests[0].title, options.title);
      return signature_request.cancel({
        signature_request_id: signature_request_id
      });
    }).then(function (result) {
      done();
    });
  });
});

describe('HelloSign Embedded', function () {
  this.timeout(60000);
  it('should embed a document.', function (done) {
    var signature_request = new HelloSign.SignatureRequest(config.hellosign_api_key, true);
    var embedded = new HelloSign.Embedded(config.hellosign_api_key, true);
    var signer_email = UUID.v1().replace(/-/g, '') + "@example.com";
    var signer_name = UUID.v1().replace(/-/g, '');
    var sample_file = fs.createReadStream(path.join(__dirname, './files/sample1.pdf'));
    var options = {
      title: UUID.v1().replace(/-/g, ''),
      file: [sample_file],
      signers: [{
        name: signer_name,
        email_address: signer_email
      }],
      client_id: config.hellosign_client_id
    };
    var signature_request_id;
    signature_request.create_embedded(options).then(function (result) {
      signature_request_id = result.signature_request.signature_request_id;
      return embedded.get({
        signature_id: result.signature_request.signatures[0].signature_id
      });
    }).then(function (result) {
      assert(result.embedded.sign_url);
      // Wait ten seconds before requesting the files.
      return when.promise(function(resolve, reject){
        setTimeout(function(){
          resolve();
        }, 10000);
      });
    }).then(function(){  
      return signature_request.files({file_type:"pdf", signature_request_id:signature_request_id});
    }).then(function(stream){
      var sample_download_path = path.join(__dirname, './files/sample_download.pdf');
      return when.promise(function(resolve, reject){
        var sample_download = fs.createWriteStream(sample_download_path);
        stream.pipe(sample_download);
        sample_download.on("error", function(e){
          reject(e);
        });
        sample_download.on("finish", function(){
          fs.unlinkSync(sample_download_path);
          resolve();
        });
      });
    }).then(function () {
      return signature_request.cancel({
        signature_request_id: signature_request_id
      });
    }).done(function (result) {
      done();
    });
  });
});

describe('HelloSign Account', function () {
  this.timeout(10000);
  it('should update an account.', function (done) {
    var account = new HelloSign.Account(config.hellosign_api_key, true);
    var temporary_callback_url = "https://example.com/" + UUID.v1().replace(/-/g, '');
    var callback_url;
    account.get().then(function (result) {
      callback_url = result.account.callback_url;
      return account.post({
        callback_url: temporary_callback_url
      });
    }).then(function (result) {
      assert.equal(result.account.callback_url, temporary_callback_url);
      return account.get();
    }).then(function (result) {
      assert.equal(result.account.callback_url, temporary_callback_url);
      return account.post({
        callback_url: callback_url
      });
    }).then(function (result) {
      assert.equal(result.account.callback_url, callback_url);
      return account.get();
    }).done(function (result) {
      assert.equal(result.account.callback_url, callback_url);
      done();
    });
  });
  it('should create and verify an account.', function (done) {
    var account = new HelloSign.Account(config.hellosign_api_key, true);
    var email = UUID.v1().replace(/-/g, '') + "@example.com";
    var password = UUID.v1().replace(/-/g, '');
    var account_id;
    account.get().then(function (result) {
      if(!result.account.is_paid_hs) {
        throw new Error("Unable to test account creation without paid API key.");
      }
      return account.create({
        email_address: email,
        password: password
      });
    }).then(function (result) {
      account_id = result.account.account_id;
      assert.equal(result.account.email_address, email);
      return account.verify({
        email_address: email
      });
    }).done(function (result) {
      assert.equal(result.account.email_address, email);
      done();
    });
  });
  it('should throw an error.', function (done) {
    var account = new HelloSign.Account("Bad API key", true);
    account.get().done(function () {
      throw new Error("API works with bad API key.")
    }, function (e) {
      assert(e instanceof HelloSign.Error);
      assert.equal(e.response.statusCode, 401);
      done();
    });
  });
});