// Example:
//
// Posts = new jQuery.Resource({url: 'http://localhost:3000/posts', model: 'post'});
//
// Posts.create({
//   title: 'hey!', 
//   body: 'post!'
// }).send({
//   success: function(){ alert('!') } 
// });
//
//    POST /posts
//    Host: localhost:3000
//
//    post%5Btitle%5D=hey!&post%5Bbody%5D=post!
//
//
// model parameter is optional for Rails compatibility. Without it 
// example above will send unwrapped parameters as POST data:  title=hey!&body=post! 

jQuery.extend({
    ResourceRequest: function(options) { this.init(options) },
    Resource: function(options) { this.init(options) }
});

//var ResourceRequest = jQuery.Class.create({
jQuery.extend(jQuery.ResourceRequest.prototype, {

  init: function(options)
  {
    if (!options) options = {};
    if (!options.dataType) options.dataType = 'json'
    this.default_options = options;
  },

  send: function(options)
  {
    if (!options) options = {};
    var d_options = this.default_options;

    // create temporary options for current request
    jQuery.each(d_options, function(i) {
      if (options[i] == undefined) {
        options[i] = d_options[i];
      }
    });

    //console.debug(options);
    jQuery.ajax(options);

    return this;
  },

  setup: function(options)
  {
    // override default options
    var d_options = this.default_options;
    jQuery.each(options, function(i) {
      d_options[i] = options[i];
    });
    this.default_options = d_options;
    return this;
  }

});

//var Resource = jQuery.Class.create({
jQuery.extend(jQuery.Resource.prototype, {
    
  init: function(options)
  {
    this.resource_url = options.url;
    delete options['url'];

    // Rails expects something like post[title]=hello
    if (options.model) {
      this.model = options.model;
      delete options['model'];
    }

    if (options['default_params'] != undefined) {
      this.default_params = options.default_params;
      delete options['default_params'];
    } else {
      this.default_params = {};
    }

    this.default_options = options; 
  },

  create: function(params)
  {
    return this._new_request('POST', params);
  },

  update: function(params)
  {
    return this._new_request('PUT', params);
  },

  get: function(params)
  {
    return this._new_request('GET',  params);
  },

  index: function(params)
  {
    return this._new_request('GET', params);
  },

  destroy: function(params)
  {
    return this._new_request('DELETE', params);
  },
  
  _new_request: function(method, params)
  {
    var url = this.resource_url;
    method = method.toUpperCase();
    if (!params) params = {};

    if (params['id'] && ( method == 'GET' || method == 'PUT' || method == 'DELETE')) {
      url = url + '/' + params['id'];
      delete params['id'];
    }

    var need_wrap = (method == 'POST' || method == 'PUT');

    if (method != 'GET' && method != 'POST') {
      params['_method'] = method;
      method = 'POST';
    }

    var request_options = this.default_options;
    
    request_options.type = method; // method is type in jQuery
    request_options.url = url;
    
    var default_params = this.default_params;
    jQuery.each(default_params, function(i){
      if (params[i] == undefined) params[i] = default_params[i];
    });
    
    if (need_wrap) params = this._wrap_params(params);

    request_options.data = params; // params is data in jQuery

    //console.debug(request_options);
    
    return new jQuery.ResourceRequest(request_options);
  },

  _wrap_params: function(params)
  {
    if (this.model) {
      var wrapped = {};
      var model = this.model;
      jQuery.each(params, function(i){
        wrapped[model+'['+i+']'] = params[i];      
      });
      return wrapped;
    } else {
      return  params;
    }
  }

});
