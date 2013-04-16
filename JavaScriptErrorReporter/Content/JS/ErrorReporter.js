(function () {
    var lastStackTrace,
        reportUrl = null,
        prevOnError = window.onerror,
        prevReady = $.fn.ready,
        prevDispatch = $.event.dispatch;

    // Send global methods with our wrappers.
    window.onerror = onError;
    $.fn.ready = readyHook;
    $.event.dispatch = dispatchHook;

    function onError(error, url, line) {
        var result = false;
        try {
            // If there was a previous onError handler, fire it.
            if (typeof prevOnError == 'function') {
                result = prevOnError(error, url, line);
            }
            // If the report URL is not loaded, load it.
            if (reportUrl === null) {
                reportUrl = $(document.body).attr('data-report-url') || false;
            }
            // If there is a rport URL, send the stack trace there.
            if (reportUrl !== false) {
                var stackTrace = getStackTrace(error, url, line, lastStackTrace);
                report(error, stackTrace);
            }
        } catch (e) {
            // Something went wrong, log it.
            if (console && console.log) {
                console.log(e);
            }
        } finally {
            // Clear the wrapped stack so it does get reused.
            lastStackTrace = null;
        }
        return result;
    }

    function readyHook(fn) {
        // Call the original ready method, but with our wrapped interceptor.
        return prevReady.call(this, fnHook);

        function fnHook() {
            try {
                fn.apply(this, arguments);
            } catch (e) {
                lastStackTrace = printStackTrace({ e: e });
                throw e;
            }
        }
    }

    function dispatchHook() {
        // Call the original dispatch method.
        try {
            prevDispatch.apply(this, arguments);
        } catch (e) {
            lastStackTrace = printStackTrace({ e: e });
            throw e;
        }
    }

    function report(error, stackTrace) {
        // Send the error to the server; fire and forget.
        $.ajax({
            url: reportUrl,
            type: 'POST',
            data: {
                error: error,
                url: window.location,
                stackTrace: stackTrace
            }
        });
    }

    function getStackTrace(error, url, line, stackTrace) {
        // Only use the current stack trace if the error matches it.
        if (stackTrace && stackTrace.length && endsWith(error, stackTrace[0])) {
            return stackTrace;
        }
        // Build an error message for uncaught exceptions that match caught exceptions.
        return [error, '    at (' + url + ':' + line + ')'];
    }

    function endsWith(string, pattern) {
        // Does the string end with a pattern?
        var d = string.length - pattern.length;
        return d >= 0 && string.lastIndexOf(pattern) === d;
    }
})(jQuery);