'use strict';
var Base = require('./base');

// origin of the settings app
var ORIGIN = 'app://settings.gaiamobile.org';

/**
 * Abstraction around system app
 * @constructor
 * @param {Marionette.Client} client for operations.
 */
function SystemApp(client) {
  Base.call(this, client, ORIGIN, SystemApp.Selectors);
}
module.exports = SystemApp;

SystemApp.Selectors = {
  'actionMenu': 'form[data-z-index-level="action-menu"]',
  'valueSelector': '.value-selector',
  'confirmOkButton': '.appWindow.active .modal-dialog-confirm-ok'
};

SystemApp.prototype = {

  __proto__: Base.prototype,

  isActionMenuVisible: function() {
    var actionMenu = null,
        displayed = false;
    this.client.switchToFrame();
    actionMenu = this.findElement('actionMenu');
    displayed = actionMenu && actionMenu.displayed();
    // Go back to settings app.
    this.launch();
    return displayed;
  },

  isValueSelectorVisible: function() {
    var valueSelector = null,
        displayed = false;
    this.client.switchToFrame();
    valueSelector = this.findElement('valueSelector');
    displayed = valueSelector && valueSelector.displayed();
    // Go back to settings app.
    this.launch();
    return displayed;
  },

 /**
  Fetch a particular type of a gaia-confirm dialog.

  @param {String} type of dialog.
  */
  getConfirmDialog: function(type) {
    var selector = 'gaia-confirm[data-type="' + type + '"]';
    return this.client.helper.waitForElement(selector);
  },

  /**
  Click confirm on a particular type of confirmation dialog.

  @param {String} type of dialog.
  @param {String} selector of the button. Defaults to .confirm.
  */
  confirmDialog: function(type, button) {
    var dialog = this.getConfirmDialog(type);
    var confirm = dialog.findElement(button || '.confirm');

    // XXX: Hack to use faster polling
    var quickly = this.client.scope({ searchTimeout: 50 });
    confirm.client = quickly;

    // tricky logic to ensure the dialog has been removed and clicked
    this.client.waitFor(function() {
      try {
        // click the dialog to dismiss it
        confirm.click();
        // ensure it is either hidden or hits the stale element ref
        return !confirm.displayed();
      } catch (e) {
        if (e.type === 'StaleElementReference') {
          // element was successfully removed
          return true;
        }
        throw e;
      }
    });
  },

  /*
  /* Click the ok button on window.confirm dialog.
   */
  confirmOk: function() {
    this.client.switchToFrame();
    var confirmButton = this.waitForElement('confirmOkButton');
    confirmButton.click();
  }
};
