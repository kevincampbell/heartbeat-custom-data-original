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
        var d = new Date();

        str = str.split("[SHOW_NAME]").join(contentMetadata.getShowName());
        str = str.split("[DAY_PART]").join(contentMetadata.getDayPart());
        str = str.split("[FORMATTED_MINUTES]").join(formatWithTwoDigits(d.getHours()) + ":" + formatWithTwoDigits(d.getMinutes()));
        str = str.split("[DATE_GET_HOURS]").join(formatHours(d.getHours()));
        str = str.split("[DAY_OF_WEEK]").join(weekdays[d.getDay()]);str = str.split("[MONTH]").join(formatWithTwoDigits(d.getMonth() + 1));
        str = str.split("[DATE_GET_DATE]").join(formatWithTwoDigits(d.getDate()));
        str = str.split("[DATE_GET_FULL_YEAR]").join(d.getFullYear());

        return str;
    }

    function formatWithTwoDigits(d) {
        return ('0' + d).slice(-2);
    }

    function formatHours(n) {
        return formatWithTwoDigits(n) + ":00";
    }
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}