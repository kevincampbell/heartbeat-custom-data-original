/* -----------------------------------
 AuthenticationProxy.js
 ------------------------------------- */

/**
 * This class is responsible for listening to post messages from NBC.com pages to the player iFrame.  The message
 * contains the user’s MVPD provider.  This data is dispatched in a PDK event used by content metadata.
 *
 * @param {EventDispatcher} _pdkEventDispatcher the event
 *    dispatcher for events related to the PDK.
 * */
function AuthenticationProxy(_pdkEventDispatcher) {
    var pdkEventDispatcher = _pdkEventDispatcher;
    var authenticationStatus = {};

    this.init = function () {
        if(typeof window.addEventListener !== 'undefined')
        {
            window.addEventListener('message', handleFilteredMessage, false);
        }
        else if(typeof window.attachEvent !== 'undefined')
        {
            window.attachEvent('onmessage', handleFilteredMessage);
        }
    };

    function onMvpdSelected(data)
    {
        authenticationStatus.mvpdid = data.mvpdid;
    }

    function onHostPageAuth(data)
    {
        authenticationStatus.isAuthenticated = (data.parameters[0] === "success");
    }

    function handleFilteredMessage(evt)
    {
        if(canHandleMessage(evt))
        {
            switch(evt.data.type)
            {
                case "hostpageauth":
                    onHostPageAuth(evt.data);
                    break;
                case "mvpdSelected":
                    onMvpdSelected(evt.data);
                    break;
            }

            pdkEventDispatcher.dispatchEvent("pageToPlayerEvent", evt.data);
        }
    }

    function canHandleMessage(evt)
    {
        return (is_allowed_origins(evt.origin) && isAllowedEventType(evt.data.type));
    }

    function isAllowedEventType(type)
    {
        switch(type)
        {
            case "hostpageauth":
            case "mvpdSelected":
                return true;
            default:
                return false;
        }
    }

    function is_allowed_origins(origin)
    {
        var allowed_origins = ["nbc.com","nbcuni.com"];
        for(i=0;i<allowed_origins.length;i++)
        {
            var expectedIndex = origin.length - allowed_origins[i].length;
            var actualIndex = origin.indexOf(allowed_origins[i]);
            var precedingCharacter = origin.charAt(actualIndex-1);

            // e.g. validates https://tve-dev.nbcuni.com or http://nbc.com but not http://www.pwned-nbc.com
            if(actualIndex === expectedIndex && (precedingCharacter === "." || precedingCharacter === "/"))
            {
                return true;
            }
        }

        return false;
    }
}
/* -----------------------------------
 ContentMetadataLocator.js
 ------------------------------------- */

var AvailabilityState = {
    AVAILABLE: "Available",
    NOT_YET_AVAILABLE: "NotYetAvailable",
    EXPIRED: "Expired",
    UNKNOWN: "Unknown"
};
function ContentMetadata() {
    var _currentRelease = null;
    var _chapters = null;
    var _availabilityState = AvailabilityState.UNKNOWN;
    var _isLive = false;
    var _airdate = null;

    function findCustomValueByFieldName(fieldName) {
        if (_currentRelease && _currentRelease.customValues) {
            var i = _currentRelease.customValues.length;
            while (i--) {
                if (_currentRelease.customValues[i].fieldName === fieldName) {
                    return _currentRelease.customValues[i].value;
                }
            }
        }
        else if (_currentRelease && _currentRelease.contentCustomData) {
            if (_currentRelease.contentCustomData[fieldName]) {
                return _currentRelease.contentCustomData[fieldName];
            }
        }
        else if (_currentRelease) {
            if (_currentRelease["nbcu$" + fieldName]) {
                return _currentRelease["nbcu$" + fieldName];
            }
        }

        return null;
    }

    this.getAvailabilityState = function () {
        return _availabilityState;
    };

    this.hasException = function () {
        return Boolean(findCustomValueByFieldName("isException"));
    };

    this.getAirDate = function()
    {
        var value;

        if(_currentRelease.airdate)
        {
            value = _currentRelease.airdate;
        }
        else if( Number(findCustomValueByFieldName("airDate")) > 0 )
        {
            value = Number(findCustomValueByFieldName("airDate"));
        }

        return (value) ? new Date(value) : value;
    };

    this.getClipType = function () {
        return findCustomValueByFieldName("programmingType") || "";
    }

    this.getAirDate = function() {
        return _airdate;
    }

    this.getClipId = function () {
        return findCustomValueByFieldName("clipId") || "";
    };

    this.getGuid = function () {
        return _currentRelease.guid;
    };

    this.getTitle = function () {
        return _currentRelease.title;
    };

    function toBoolean(val) {
        if (!isNaN(val)) {
            return Boolean(Number(val));
        }

        switch (String(val).toLowerCase()) {
            case "true":
            case "yes":
                return true;
            default:
                return false;
        }
    }

    this.isFullEpisode = function () {
        return toBoolean(findCustomValueByFieldName("fullEpisode"));
    };

    this.isLive = function () {
        return _isLive;
    };

    this.getDayPart = function () {
        return findCustomValueByFieldName("dayPart") || "";
    };

    this.getEntitlement = function () {
        return findCustomValueByFieldName("entitlement") || "";
    };

    this.getProvider = function () {
        return _currentRelease.provider;
    };

    this.getClipLength = function () {
        return _currentRelease.trueLength;
    };

    this.getEpisodeNumber = function () {
        return findCustomValueByFieldName("episodeNumber");

    };

    this.getExternalAdvertiserId = function () {
        return findCustomValueByFieldName("externalAdvertiserId");

    };

    this.getAdvertisingGenre = function () {
        return findCustomValueByFieldName("advertisingGenre");
    };

    this.getSeasonNumber = function () {
        return findCustomValueByFieldName("seasonNumber");

    };

    this.getPubDate = function () {
        return findCustomValueByFieldName("pubDate");
    };

    this.getAirOrder = function () {
        return findCustomValueByFieldName("airOrder");
    };

    this.getShowName = function () {
        var categories = _currentRelease.categories;
        for (var cnt = 0; cnt < categories.length; cnt++) {
            if (categories[cnt]) {
                if (categories[cnt].name.toLowerCase() === "live") return categories[cnt].name;
                if (categories[cnt].name.toLowerCase().indexOf("series/") === 0) {
                    var startIndex = (categories[cnt].name.toLowerCase().indexOf("series/") === 0) ? 7 : 0;
                    return categories[cnt].name.slice(startIndex);
                }
            }
        }
        return '';
    };

    this.isLiveStream = function () {
        var isLiveStream = (_currentRelease.categories[0] ? ((_currentRelease.categories[0].name.toLowerCase() === "live") ? true : false) : "");
        return isLiveStream;
    };

    this.getPermalink = function () {
        return findCustomValueByFieldName("permalink");
    };

    this.getPrimaryCategory = function()
    {
        return findCustomValueByFieldName("primaryCategory[0]");
    };

    this.getSecondaryCategory = function()
    {
        return findCustomValueByFieldName("secondaryCategory[0]");
    };

    this.getChapters = function () {
        return _chapters;
    };

    this.getPageLocation = function () {
        ref = window.location.href.toString();
        //Get only the page url and remove any parameters
        pageURL = ref.split("?")[0];
        return pageURL;
    };

    this.getPageReferrer = function () {
        ref = window.document.referrer.toString();
        //Get only the page url and remove any parameters
        pageURL = ref.split("?")[0];
        return pageURL;
    };

    this.setReleaseData = function (release) {
        _currentRelease = release;
    };

    this.setClipData = function (clip) {

    };

    this.setChapters = function (chapters) {
        _chapters = chapters;
    };

    this.setAvailabilityState = function (value) {
        _availabilityState = value;
    };

    this.setAirDate = function (value) {
        _airdate = value;
    }

    this.setIsLiveState = function (value) {
        _isLive = false;
        var o;
        for (var i = 0; i < value.categories.length; i++) {
            o = value.categories[i];
            if (o.name.toLowerCase().indexOf("live") === 0) {
                _isLive = true;
            }
        }
    }

}

/**
 Value object containing fields to allow translation of release object info into
 ContentMetadata and a key to allow caching.

 @param key a unique identifier to allow caching
 @param release data from the Release object
 @param chapters midroll/chapter data for a clip
 * */
function ReleaseVO(key, release, chapters, airdate) {
    this.key = key;
    this.release = release;
    this.chapters = chapters;
    this.airdate = airdate;
}

/**
 Parses event data into value objects that our domin can understand
 * */
function EventTranslator() {
    function getFirstNonAdBaseClip(clips) {
        for (var i = 0; i < clips.length; i++) {
            if (!clips[i].isAd) {
                return clips[i];
            }
        }
    }
    function getFirstNonAdClip(clips) {
        for (var i = 0; i < clips.length; i++) {
            if (!clips[i].baseClip.isAd) {
                return clips[i];
            }
        }
    }

    function getReleaseBaseClipWithTitle(e) {
        var clip = getFirstNonAdBaseClip(e.data.baseClips);

        if (!clip.title) {
            clip.title = getFirstNonAdClip(e.data.clips).title;
        }

        return clip;
    }

    /**
     Returns the Release object contained in an event

     @param e an event object
     @return the Release object delivered in the event payload
     */
    function getReleaseData(e) {
        if (e.data.baseClips) {
            return getReleaseBaseClipWithTitle(e);
        }
        else {
            return e.data;
        }
    }

    /**
     Returns the key used by the cache manager to retrieve content metadata

     @param e an event object
     @return the key used by the cache manager, in this case, the guid
     */
    function getContentKey(e) {
        return getReleaseData(e).guid;
    }

    function getChapters(e) {
        if (e.data.chapters.chapters) {
            return e.data.chapters.chapters;
        }
        else {
            return e.data.chapters;
        }
    }

    function canKnowAvailabilityState(e) {
        return (e.data && e.data.baseClip && e.data.baseClip.contentCustomData);
    }

    function hasAvailabilityException(e) {
        var isException = e.data.baseClip.contentCustomData.isException;
        if (typeof isException === "object") isException = isException.value;

        return (isException === "true");
    }

    function isAvailable(e) {
        return (canKnowAvailabilityState(e) && !hasAvailabilityException(e));
    }

    function isNotYetAvailable(e) {
        return (canKnowAvailabilityState(e) && hasAvailabilityException(e) && (e.data.baseClip.contentCustomData.exception === AvailabilityState.NOT_YET_AVAILABLE));
    }

    function isExpired(e) {
        return (canKnowAvailabilityState(e) && hasAvailabilityException(e) && (e.data.baseClip.contentCustomData.exception === AvailabilityState.EXPIRED));
    }

    /**
     * Creates a ReleaseVO from event data
     *
     * @param {Object} e an event object
     * */
    this.translate = function (e) {
        var release = getReleaseData(e);
        var key = release.guid;
        var chapters = getChapters(e);
        var airdate = e.data.airdate;

        return new ReleaseVO(key, release, chapters, airdate);
    };

    /**
     * Parses an event object to determine the AvailabilityState of the media
     *
     * @param {Object} e an event object
     * @returns {String}
     */
    this.translateAvailabilityState = function (e) {
        if (isAvailable(e)) {
            return AvailabilityState.AVAILABLE;
        }
        else if (isNotYetAvailable(e)) {
            return AvailabilityState.NOT_YET_AVAILABLE;
        }
        else if (isExpired(e)) {
            return AvailabilityState.EXPIRED;
        }
        else {
            return AvailabilityState.UNKNOWN;
        }
    };
}

/**
 Creates and stores ContentMetadata objects for lookup.
 * */
function ContentMetadataLocator(pdk, translator) {
    var _this = this;
    var _pdk = pdk;
    var _translator = translator;
    var cache = {};
    var currentContentMetadata;

    this.init = function () {
        _pdk.controller.addEventListener("OnMediaLoadStart", updateAvailabilityState);
        _pdk.controller.addEventListener("OnReleaseStart", this.updateReleaseData);
        _pdk.controller.addEventListener("OnSetReleaseUrl", onSetReleaseUrl);
    };

    this.getCurrentContentMetadata = function () {
        return currentContentMetadata;
    };

    this.getContentMetadata = function (e) {
        var vo = _translator.translate(e);

        if (!cache[vo.key]) {
            cache[vo.key] = newContentMetadata(vo.release, vo.chapters, e.data.airdate);
        }

        return cache[vo.key];
    };

    function newContentMetadata(release, chapters, airdate) {
        var contentMetadata = new ContentMetadata();
        contentMetadata.setReleaseData(release);
        contentMetadata.setChapters(chapters);
        contentMetadata.setIsLiveState(release);
        contentMetadata.setAirDate(airdate);
        return contentMetadata;
    }

    function updateAvailabilityState(e) {

        if (currentContentMetadata) {
            currentContentMetadata.setAvailabilityState(translator.translateAvailabilityState(e));
            _pdk.controller.dispatchEvent(ContentMetadataUpdateEvent.CONTENT_METADATA_UPDATE, currentContentMetadata);
        }
    }

    this.updateReleaseData = function (e) {
        _pdk.controller.removeEventListener("OnReleaseStart", this.updateReleaseData);
        currentContentMetadata = _this.getContentMetadata(e);
        _pdk.controller.dispatchEvent(ContentMetadataUpdateEvent.CONTENT_METADATA_UPDATE, currentContentMetadata);
    }

    function onSetReleaseUrl(e) {
        _pdk.controller.addEventListener("OnReleaseStart", this.updateReleaseData);
    }

}

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