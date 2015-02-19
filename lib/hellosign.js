var request = require("request");
var when = require("when");
var _ = require("underscore");
var querystring = require('querystring');
var fs = require("fs");

// Error technique from 
// http://stackoverflow.com/questions/783818/how-do-i-create-a-custom-error-in-javascript
var HelloSignError = function () {
  var tmp = Error.apply(this, arguments);
  tmp.name = this.name = 'HelloSignError';
  this.stack = tmp.stack;
  this.message = tmp.message;
  return this;
}
var IntermediateInheritor = function () {}
IntermediateInheritor.prototype = Error.prototype;
HelloSignError.prototype = new IntermediateInheritor();

var _request = function (options) {
  return when.promise(function (resolve, reject, notify) {
    var form_data = options.form;
    delete options.form;
    var req = request(options, function (error, response, body) {
      if(error) {
        throw error;
      }
      var data = body === " " ? {} : JSON.parse(body);
      if(response.statusCode === 200) {
        return resolve(data);
      } else if(data.error && data.error.error_msg) {
        var e = new HelloSignError(data.error.error_msg);
        e.response = response;
        return reject(e);
      } else {
        var e = new HelloSignError(body);
        e.response = response;
        return reject(e);
      }
    });
    if(!form_data) {
      return;
    }
    _.each(form_data, function (value, key) {
      if(_.isObject(value) && !(value instanceof fs.ReadStream)) {
        _.each(value, function (x, index) {
          if(_.isObject(x) && !(x instanceof fs.ReadStream)) {
            _.each(x, function (v, k) {
              form_data[key + "[" + index + "][" + k + "]"] = v;
            });
          } else {
            form_data[key + "[" + index + "]"] = x;
          }
        });
        delete form_data[key];
      }
    });
    var form = req.form();
    _.each(form_data, function (value, key) {
      form.append(key, value);
    });
  });
}

var Account = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

Account.prototype.get = function () {
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/account",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Account.prototype.post = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/account",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Account.prototype.create = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/account/create",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
}

Account.prototype.verify = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/account/verify",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
}

var SignatureRequest = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

SignatureRequest.prototype.get = function (parameters) {
  if(!parameters.signature_request_id) {
    throw new HelloSignError("Missing required parameter signature_request_id");
  }
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/signature_request/" + parameters.signature_request_id,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.list = function (parameters) {
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/signature_request/list?" + querystring.stringify(parameters),
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.send = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/send",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.send_with_template = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/send_with_template",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.remind = function (parameters) {
  if(!parameters.signature_request_id) {
    throw new HelloSignError("Missing required parameter signature_request_id");
  }
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/remind/" + parameters.signature_request_id,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.cancel = function (parameters) {
  if(!parameters.signature_request_id) {
    throw new HelloSignError("Missing required parameter signature_request_id");
  }
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/cancel/" + parameters.signature_request_id,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.create_embedded = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/create_embedded",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.create_embedded_with_template = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/signature_request/create_embedded_with_template",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

SignatureRequest.prototype.files = function (parameters, _options) {
  _options = _options || {};
  if(!parameters.signature_request_id) {
    throw new HelloSignError("Missing required parameter signature_request_id");
  }
  var signature_request_id = parameters.signature_request_id;
  delete parameters.signature_request_id;
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/signature_request/files/" + signature_request_id + "?" + querystring.stringify(parameters),
    auth: {
      username: this.api_key,
      password: ""
    }
  };
  return when.promise(function(resolve, reject){
    var req = request(options);
    req.on('response', function (response) {
      if(_options.inline) {
        response.headers['content-disposition'] = response.headers['content-disposition'].replace("attachment", "inline");
      }
      if(response.statusCode === 200) {
        resolve(req);
      } else {
        console.log("https://api.hellosign.com/v3/signature_request/files/" + signature_request_id + "?" + querystring.stringify(parameters));
        var e = new HelloSignError("Unable to open stream, returned status " + response.statusCode);
        e.response = response;
        reject(e);
      }
    });
  });
};

var Template = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

Template.prototype.get = function (parameters) {
  if(!parameters.template_id) {
    throw new HelloSignError("Missing required parameter template_id");
  }
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/template/" + parameters.template_id,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Template.prototype.list = function (parameters) {
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/template/list?" + querystring.stringify(parameters),
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Template.prototype.add_user = function (parameters) {
  if(!parameters.template_id) {
    throw new HelloSignError("Missing required parameter template_id");
  }
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/template/add_user/" + parameters.remove_user,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Template.prototype.remove_user = function (parameters) {
  if(!parameters.template_id) {
    throw new HelloSignError("Missing required parameter template_id");
  }
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/template/remove_user/" + parameters.remove_user,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

var Team = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

Team.prototype.get = function () {
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/team",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Team.prototype.post = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/team",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Team.prototype.create = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/team/create",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Team.prototype.destroy = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/team/destroy",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Team.prototype.add_member = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/team/add_member",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

Team.prototype.remove_member = function (parameters) {
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/team/remove_member",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

var UnclaimedDraft = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

UnclaimedDraft.prototype.create = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/unclaimed_draft/create",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

UnclaimedDraft.prototype.create_embedded = function (parameters) {
  parameters.test_mode = this.test_mode;
  var options = {
    method: "POST",
    form: parameters,
    url: "https://api.hellosign.com/v3/unclaimed_draft/create_embedded",
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

var Embedded = function (api_key, test_mode) {
  this.api_key = api_key;
  this.test_mode = (test_mode === "1" || test_mode === 1 || test_mode === true) ? "1" : "0";
};

Embedded.prototype.get = function (parameters) {
  if(!parameters.signature_id) {
    throw new HelloSignError("Missing required parameter signature_id");
  }
  var options = {
    method: "GET",
    url: "https://api.hellosign.com/v3/embedded/sign_url/" + parameters.signature_id,
    auth: {
      username: this.api_key,
      password: ""
    }
  }
  return _request(options);
};

module.exports = {
  Error: HelloSignError,
  Account: Account,
  SignatureRequest: SignatureRequest,
  Template: Template,
  Team: Team,
  UnclaimedDraft: UnclaimedDraft,
  Embedded: Embedded
};