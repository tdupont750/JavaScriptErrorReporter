$(function () {
    init();

    function init() {
        $('#test').click(onClick);

        // Example of error during ready.
        boom();
    }

    function boom() {
        var x = {};
        x.sonicBoom();
    }

    function onClick() {
        // Example of error during event.
        boom();
    }
});