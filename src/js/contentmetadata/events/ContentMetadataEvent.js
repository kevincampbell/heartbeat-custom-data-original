/* -----------------------------------
 ContentMetadataEvent.js
 ------------------------------------- */


/**
 * ContentMetadataEvent - This type of event fires when the current
 *    release metadata changes
 */
function ContentMetadataEvent(type, contentMetadata) {
    this.type = type;
    this.data = contentMetadata;
}
ContentMetadataEvent.CONTENT_METADATA_UPDATE = "contentMetadataUpdate";