/**
 * @constructor
 */
webfont.FontdeckScript = function(domHelper, configuration) {
  this.domHelper_ = domHelper;
  this.configuration_ = configuration;
  this.fontFamilies_ = [];
  this.fontVariations_ = {};
  this.fvd_ = new webfont.FontVariationDescription();
};

webfont.FontdeckScript.NAME = 'fontdeck';
webfont.FontdeckScript.HOOK = '__webfontfontdeckmodule__';
webfont.FontdeckScript.API = '//f.fontdeck.com/s/css/js/';

webfont.FontdeckScript.prototype.getScriptSrc = function(projectId) {
  var protocol = this.domHelper_.getProtocol();
  // For empty iframes, fall back to config window's hostname.
  var hostname = this.domHelper_.getWindow().location.hostname ||
      this.domHelper_.getConfigWindow().location.hostname;
  var api = this.configuration_['api'] || webfont.FontdeckScript.API;
  return protocol + api + hostname + '/' + projectId + '.js';
};

webfont.FontdeckScript.prototype.supportUserAgent = function(userAgent, support) {
  var projectId = this.configuration_['id'];
  var window = this.domHelper_.getWindow();
  var self = this;

  if (projectId) {
    // Provide data to Fontdeck for processing.
    if (!window[webfont.FontdeckScript.HOOK]) {
      window[webfont.FontdeckScript.HOOK] = {};
    }

    // Fontdeck will call this function to indicate support status
    // and what fonts are provided.
    window[webfont.FontdeckScript.HOOK][projectId] = function(fontdeckSupports, data) {
      for (var i = 0, j = data['fonts'].length; i<j; ++i) {
        var font = data['fonts'][i];
        // Add the FVDs
        self.fontFamilies_.push(font['name']);
        self.fontVariations_[font['name']] = [self.fvd_.compact("font-weight:" + font['weight'] + ";font-style:" + font['style'])];
      }
      support(fontdeckSupports);
    };

    // Call the Fontdeck API.
    var script = this.domHelper_.createScriptSrc(this.getScriptSrc(projectId));
    this.domHelper_.insertInto('head', script);

  } else {
    support(true);
  }
};

webfont.FontdeckScript.prototype.load = function(onReady) {
  onReady(this.fontFamilies_, this.fontVariations_);
};

globalNamespaceObject.addModule(webfont.FontdeckScript.NAME, function(configuration, domHelper) {
  return new webfont.FontdeckScript(domHelper, configuration);
});
