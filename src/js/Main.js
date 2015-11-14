/* -----------------------------------
 Main.js
 ------------------------------------- */

function loadHeartbeatApp() {
    console.log('[NBCHeartbeatApp] -----> OnPlayerLoaded');
    NBCHeartbeatCustomData.init();
}

function NBCHeartbeatApp() {
    this.contentMetadata = null;
    this.cache = null;
    app = this;
}
NBCHeartbeatApp.prototype.init = function() {
    app.initServices();
    app.initContentMetadata();
}

NBCHeartbeatApp.prototype.initServices = function () {
    console.log('[NBCHeartbeatApp] -----> initServices() contentMetadata created');
    var translator = new EventTranslator();
    contentMetadata = new ContentMetadataLocator($pdk, translator);
    contentMetadata.init();
    authenticationProxy = new AuthenticationProxy($pdk.controller);
    authenticationProxy.init();
};

NBCHeartbeatApp.prototype.initContentMetadata = function () {
    if (app.cache) {
        console.log('[NBCHeartbeatApp] -----> cache detected, use stored release data.');
        contentMetadata.updateReleaseData(app.cache);
    } else {
        console.log('[Metrics] 2 [MAIN] -----> cache NOT detected, wait for PDK events.');
        $pdk.controller.addEventListener("OnMediaLoadStart", contentMetadata.contentMetadataupdateAvailabilityState);
        $pdk.controller.addEventListener("OnReleaseStart", contentMetadata.updateReleaseData);
        $pdk.controller.addEventListener("OnSetReleaseUrl", contentMetadata.onSetReleaseUrl);
    }
}

NBCHeartbeatApp.prototype.pluginCallback = function(event) {
    // main video metadata
    if (event.type == "OnReleaseStart") {
        var playlist = event.data;
        return {
            myField: "My Custom main value!!!!!!"
        }
    }
    // ad metadata
    else if (event.type == "OnMediaStart" && event.data.baseClip.isAd) {
        var clip = event.data;
        return {
            myField: "My Custom ad value!!!!!!"
        }
    }
    // chapter metadata
    else if (event.type == "OnMediaStart" && !event.data.baseClip.isAd) {
        var clip = event.data;
        return {
            myField: "My Custom chapter value!!!!!!"
        }
    }
};

var NBCHeartbeatCustomData = new NBCHeartbeatApp();
$pdk.controller.addEventListener("OnPlayerLoaded", loadHeartbeatApp);
$pdk.controller.addEventListener("OnReleaseStart", function (e) {
    console.log('[NBCHeartbeatApp] -----> OnReleaseStart');
    NBCHeartbeatCustomData.cache = e;
});

// Specify this function for MPX Heartbeat plugin's "Custom Meta Callback"
function NBCHeartbeatCallback(event) {
    return NBCHeartbeatCustomData.pluginCallback(event);
}