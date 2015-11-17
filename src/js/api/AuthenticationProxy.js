/* -----------------------------------
 AuthenticationProxy.js
 ------------------------------------- */

/**
 * This class is responsible for listening to post messages from NBC.com pages to the player iFrame.  The message
 * contains the user’s MVPD provider.  This data is dispatched from the PDK controller which ContentMetadata listens for.
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