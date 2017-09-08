var openPhotoSwipe = function() {
    var pswpElement = document.querySelectorAll('.pswp')[0];

    // build items array
    var items = [
        {
            html: '<div class="canvas-centered-container"></div>',
            source: '/gallery/img/asm_overview.pdf',
            rotate: 0
        },
        {
            src: 'https://farm7.staticflickr.com/6175/6176698785_7dee72237e_b.jpg',
            w: 1024,
            h: 683,
            rotate: 0
        }
    ];

    // define options (if needed)
    var options = {
        showAnimationDuration: 0,
        hideAnimationDuration: 0,
        modal: false,
        closeOnVerticalDrag: false,
        closeOnScroll: false,

        closeEl:true,
        captionEl: true,
        fullscreenEl: true,
        zoomEl: true,
        shareEl: true,
        counterEl: true,
        arrowEl: true,
        preloaderEl: true,

        shareButtons: [
            {id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
        ],

        getImageURLForShare: function (shareButtonData) {
            var item = gallery.currItem;
            return item.src || item.source;
        },

        addCaptionHTMLFn: function(item, captionEl) {
            return true;
        },

    };

    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

    gallery.listen('afterChange', function () {
        var currItem = gallery.currItem;
        var canvasContainer = currItem.container.children[0];
        if (currItem.html && canvasContainer.children.length === 0) {
            renderPdf(canvasContainer, currItem.source, currItem.rotate);
        }
    });

    gallery.init();
    var rotateLeftBtn = gallery.template.querySelectorAll(".pswp__button.pswp__button--rotate[data-rotate='left']")[0];
    var rotateRightBtn = gallery.template.querySelectorAll(".pswp__button.pswp__button--rotate[data-rotate='right']")[0];
    rotateLeftBtn.addEventListener("click", function () {
        rotateItem(gallery.currItem, false);
    });
    rotateRightBtn.addEventListener("click", function () {
        rotateItem(gallery.currItem, true);
    });

    var zoomInBtn = gallery.template.querySelectorAll(".pswp__button.pswp__button--zoom[data-zoom='in']")[0];
    var zoomOutBtn = gallery.template.querySelectorAll(".pswp__button.pswp__button--zoom[data-zoom='out']")[0];
};

openPhotoSwipe();

function renderPdf(el, source, rotate) {
    var rotate = rotate || 0;
    var loadingTask = PDFJS.getDocument(source);
    loadingTask.promise.then(function (pdf) {
        for (var num = 1; num <= pdf.numPages; num++) {
            pdf.getPage(num).then(function (page) {
                var scale = 1.5;
                var viewport = page.getViewport(scale, rotate);
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                el.appendChild(canvas);
                var renderTask = page.render(renderContext);
            }, function (reason) {
                console.error(reason);
            })
        }

    })
}

function rotateItem(item, clockwise) {
    var _clockwise = typeof clockwise !== undefined ? clockwise : true;
    var deg = item.rotate + (_clockwise ? 90 : -90);
    item.rotate = Math.abs(deg) === 360 ? 0 : deg;
    if (item.source) {
        var canvasContainer = item.container.children[0];
        while (canvasContainer.firstChild) {
            canvasContainer.removeChild(canvasContainer.firstChild);
        }
        if (canvasContainer.children.length === 0) {
            renderPdf(canvasContainer, item.source, item.rotate);
        }
    } else if (item.src) {
        var img = item.container.getElementsByTagName("img")[0];
        var deg = item.rotate;
        img.style.webkitTransform = 'rotate('+deg+'deg)';
        img.style.mozTransform    = 'rotate('+deg+'deg)';
        img.style.msTransform     = 'rotate('+deg+'deg)';
        img.style.oTransform      = 'rotate('+deg+'deg)';
        img.style.transform       = 'rotate('+deg+'deg)';
    }
}