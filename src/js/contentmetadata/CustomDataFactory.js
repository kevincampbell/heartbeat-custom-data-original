/* -----------------------------------
 CustomDataFactory.js
 ------------------------------------- */

/**
 * This class translates keys used in model JSON objects, eg. [SHOW_NAME], and returns clip metadata.
 *
 * @param {EventDispatcher} _pdkEventDispatcher the event
 *    dispatcher for events related to the PDK - our custom metadata is also dispatched.
 * */
function CustomDataFactory(_pdkEventDispatcher) {
    var pdkEventDispatcher = _pdkEventDispatcher;
    pdkEventDispatcher.addEventListener(ContentMetadataEvent.CONTENT_METADATA_UPDATE, onContentMetadataUpdate);
    var contentMetadata = null;

    /**
     * Public functions
     */
    this.initialized = function() {
        if (contentMetadata === null) {
            return false;
        } else {
            return true;
        }
    };

    this.getCustomData = function (key) {
        var val = "";
        if (contentMetadata != null) {
            val = replaceKey(key);
        }
        return val;
    };

    /**
     * Private functions
     */
    function onContentMetadataUpdate(event) {
        contentMetadata = event.data;
        console.log("[NBCHeartbeatApp] CustomDataFactory.onContentMetadataUpdate()");
    }

    function replaceKey(str) {
        str = str.split("[SHOW_NAME]").join(contentMetadata.getShowName());
        str = str.split("[DAY_PART]").join(contentMetadata.getDayPart());

        return str;
    }
}