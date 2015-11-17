/* -----------------------------------
 Main.js
 ------------------------------------- */

function loadHeartbeatApp() {
    console.log("[NBCHeartbeatApp] -----> OnPlayerLoaded");
    NBCHeartbeatCustomData.init();
}

function NBCHeartbeatApp() {
    this.authenticationProxy = null;
    this.contentMetadata = null;
    this.cache = null;
    this.customDataFactory = null;
    app = this;
}

NBCHeartbeatApp.prototype.init = function () {
    this.customDataFactory = new CustomDataFactory($pdk.controller);
    this.contentMetadata = new ContentMetadataLocator($pdk, new EventTranslator());
    this.contentMetadata.init();
    this.authenticationProxy = new AuthenticationProxy($pdk.controller);
    this.authenticationProxy.init();
    if (app.cache) {
        console.log("[NBCHeartbeatApp] -----> cache detected, use stored release data.");
        contentMetadata.updateReleaseData(app.cache);
    }
};

NBCHeartbeatApp.prototype.pluginCallback = function(event) {
    var payload = {};
    if (this.customDataFactory.initialized()) {
        for (var fieldName in NBCUHeartbeatCustomFields) {
            payload[fieldName] = this.customDataFactory.getCustomData(NBCUHeartbeatCustomFields[fieldName]);
        }
    }
    // main video metadata
    if (event.type == "OnReleaseStart") {
        return payload;
    }
    // ad metadata
    else if (event.type == "OnMediaStart" && event.data.baseClip.isAd) {
        return payload;
    }
    // chapter metadata
    else if (event.type == "OnMediaStart" && !event.data.baseClip.isAd) {
        return payload;
    }
};

var NBCHeartbeatCustomData = new NBCHeartbeatApp();
$pdk.controller.addEventListener("OnPlayerLoaded", loadHeartbeatApp);
$pdk.controller.addEventListener("OnReleaseStart", function (e) {
    console.log("[NBCHeartbeatApp] -----> OnReleaseStart");
    NBCHeartbeatCustomData.cache = e;
});

// Specify this function for MPX Heartbeat plugin's "Custom Meta Callback"
function NBCHeartbeatCallback(event) {
    return NBCHeartbeatCustomData.pluginCallback(event);
}