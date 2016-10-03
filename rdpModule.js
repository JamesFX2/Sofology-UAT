$(document).ready(function () {

    var urlParts = window.location.pathname.split('/');
    var rangeName = urlParts[urlParts.length - 1];
    rdpModule.init(rangeName);
    basketModule.x();
});

var rdpModule = (function () {
    var rangeData = null;
    var selectedSwatch = null;
    var selectedSwatchIndex = 0;
    var selectedVariant;
    var currentSelectedProduct;
    var swatchLayout = { view: 'grid' };
    var swatchData;
    var currentActiveConfiguratorSlide = 0;
    var cacheData = {};
    var apiRoot = (
        window.location.href.indexOf('dev') === -1
        && window.location.href.indexOf('uat') === -1
        && window.location.href.indexOf('localhost') === -1) ? 'https://api.sofology.co.uk/api/v2' : 'https://api.uat.sofology.co.uk/api/v2';

    function getData(rangeName) {
        $.ajax({
            url: apiRoot + "/range/" + rangeName + "?maxPricingStrategy=ALL&minPricingStrategy=NOFOOTSTOOLS",
            beforeSend: sofologistHeaders
        })
        .then(function (data) {
            rangeData = data;
            return rangeData;
        })
        .then(function (data) {
            loadRangeName(data);
            return data;
        })
        .then(function (data) {
            loadIntroPanel(data);
            return data;
        })
        .then(function (data) {
            loadLifeStyle(data);
            return data;
        })
        .then(function (data) {
            swatchLayout.view = $('.views-options').data('defaultView');
            loadSwatches(data);
            return data;
        })
        .then(function (data) {
            loadFeaturesBenefits(data);
            return data;
        })
        .done(function (data) {
            setUpSlickCarousels();
            return data;
        })
        .fail(function (err, status) {
            window.location = '/page-not-found';
        });
    }

    function loadFeaturesBenefits(data) {

        if (data.featuresAndBenefitsImage != null) {
            var img = cloudinaryModule.transform(data.featuresAndBenefitsImage, { q: 70 });
            $('.feature-benefits').css('background-image', 'url(' + img + ')').
                attr('data-mobileportrait', img).
                attr('data-mobilelandscape', img).
                attr('data-ipadportrait', img).
                attr('data-ipadlandscape', img).
                attr('data-max', img).
                attr('data-src', img);
        }
        var numberOfLines = $(".lines").attr("data-attr-block-size");
        var html = '';
        var blocks = createBlocksForFeaturesBenefits(numberOfLines, data.keyFacts);

        var headerText = $('.feature-benefits-header-text').text();
        headerText += rangeData.name.charAt(0).toUpperCase() + rangeData.name.slice(1);
        $('.feature-benefits-header-text').text(headerText);


        if (numberOfLines != 9999) {
            var template = $.templates('#feature-benefits-template-textblock');
            $.each(blocks, function (index, value) {
                html += template.render({ model: value, blockSize: numberOfLines, position: index });
            });
            $('.scroller').html(html);
            var currentPosition = 0;
            var calc = 0;
            $("#next-scroll").click(function () {
                currentPosition += 1;
                if (currentPosition >= blocks.length) {
                    $(".scroller").animate({ scrollTop: 0 }, 1200);
                    calc = 0;
                    currentPosition = 0;
                } else {
                    calc += $("[data-position=" + currentPosition + "]").offset().top - $('.scroller').offset().top;
                    $(".scroller").animate({ scrollTop: calc }, 1200);
                }
            });
        } else {
            html += $.templates('#feature-benefits-template-textblock-all').render({ model: blocks, blockSize: numberOfLines });
            $('.scroller--fixed').html(html);
        }
    }

    function createBlocksForFeaturesBenefits(blockSize, arr) {
        var count = 1;
        var outerArray = [];
        var innerArray = [];
        if (blockSize == 9999) {
            $.each(arr, function (index, value) {
                outerArray.push(value);
            });
        } else {
            $.each(arr, function (index, value) {
                if (count > blockSize) {
                    count = 1;
                    outerArray.push(innerArray);
                    innerArray = [];
                }
                innerArray.push(value);
                count++;
            });
        }
        return outerArray;
    }

    function loadRangeName(data) {
        $('#rangeName').html('The ' + data.name);
    }

    function loadLifeStyle(data) {
        $('.lifestyle img').attr("src", cloudinaryModule.transform(data.lifestyleImage, { q: 70, w: 1600, c: 'scale' }));
    }

    function loadIntroPanel(data) {
        var introTemplate = $.templates("#intro-template");
        var html = introTemplate.render(
        {
            fromPrice: data.minimumPrice,
            toprice: data.maximumPrice,
            description: data.description,
            rangeName: data.name,
            numberOfItems: data.itemCount,
            materialType: data.materialType,
            numberOfSwatches: data.swatches.length,
            scoopImage: cloudinaryModule.transform(data.scoopImage, { q: 70, w: 1600, c: 'scale' })
        });
        $('#intro-panel').append(html);
    }

    function loadSwatches(data) {
        loadRangeCount(data);
        $('.slick-colour').html('');
        var swatchTemplate = $.templates("#swatch-template");
        $.each(data.swatches, function (index, value) {
            var model = {
                image: cloudinaryModule.transform(value.image, { b: 'rgb:ffffff', c: 'scale', ext: 'png', w: 600, q: 40 }),
                title: value.name,
                swatchName: value.name,
                layout: swatchLayout.view,
                index: index
            };
            var html = swatchTemplate.render(model);
            $('.slick-colour').append(html);
        });
        loadSelectedSwatchByName(data.selectedSwatch);
        loadProductsForSelectedSwatch(selectedSwatch, data.name);
    }

    function loadSelectedSwatchByName(swatchName) {
        selectedSwatch = $.grep(rangeData.swatches, function (n, i) {
            return n.name === swatchName;
        })[0];
        return selectedSwatch;
    }

    function loadProductsForSelectedSwatch(selectedSwatch, rangeName) {
        $('.slick-configure').fadeIn();
        try {
            $('.slick-configure').slick('unslick');
            $('.slick-configure').html('');
            $('.slick-configure-full').slick('unslick');
            $('.slick-configure-full').html('');
        }
        catch (e) { /* ignore as object may not yet be initated */ }
        var swatchTemplate = $.templates("#configure-template");

        $.each(selectedSwatch.products, function (index, value) {
            var displayDevlivery = value.leadDays == 0 ? false : true;
            var deliveryDisplay = '';
            if (displayDevlivery) {
                var leadWeeks = Math.floor(value.leadDays / 7);

                deliveryDisplay = leadWeeks <= 0 ? value.leadDays === 1 ? value.leadDays + " day" : value.leadDays + " days" :
                    leadWeeks === 1 ? leadWeeks + " week" : leadWeeks + " weeks";
            }
            var html = swatchTemplate.render({
                image: cloudinaryModule.transform(value.image, { c: 'scale', w: 600, q: 40 }),
                title: value.name,
                price: value.minimumPrice,
                swatchName: selectedSwatch.name,
                rangeName: rangeData.name,
                index: index,
                delivery: deliveryDisplay,
                displayDevlivery: displayDevlivery
            });
            $('.slick-configure').append(html);
            $('.slick-configure-full').append('<div></div>');
        });

        $('.slick-configure').slick({
            slidesToShow: 1,
            dots: true,
            mobileFirst: true,
            prevArrow:
                '<div class="slick-prev slick-arrow" style="display: table;"><i class="fa fa-angle-left fa-2x" aria-hidden="true"></i></div>',
            nextArrow:
                '<div class="slick-next slick-arrow" style="display: table;"><i class="fa fa-angle-right fa-2x" aria-hidden="true"></i></div>',
            customPaging: function (slider, i) {
                return '<i class="fa fa-pagination-static"></i>';
            },
            responsive: [
                { breakpoint: 767, settings: { slidesToShow: 2, slidesToScroll: 2 } },
                { breakpoint: 992, settings: { slidesToShow: 3, slidesToScroll: 3 } },
                { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 4 } }
            ]
        });

        $('.slick-configure-full').slick({
            slidesToShow: 1,
            dots: false,
            prevArrow:
                '<div class="slick-prev slick-arrow" style="display: table;"><i class="fa fa-angle-left fa-2x" aria-hidden="true"></i></div>',
            nextArrow:
                '<div class="slick-next slick-arrow" style="display: table;"><i class="fa fa-angle-right fa-2x" aria-hidden="true"></i></div>',
            customPaging: function (slider, i) {
                return '<i class="fa fa-pagination-static"></i>';
            }
        });
        $(".slick-configure-full").unbind("afterChange");
        $('.slick-configure-full').on('afterChange', function (event, slick, currentSlide) {
            selectedVariant = swatchData[currentSlide];
            currentActiveConfiguratorSlide = currentSlide;
            currentSelectedProduct = $.grep(selectedVariant.products, function (n, i) {
                return n.selected === true;
            })[0];
            changeOption();
            bindQuanityButtons();
            bindCloseButton();
        });
        $('.slick-configure-full').hide();
        $('.configure header h2 span').html(selectedSwatch.name);

        loadSwatchConfigurations(0, selectedSwatch.name, rangeName);
    }

    function loadRangeCount(data) {
        var rangeCount = data.swatches.length;
        $('#rangeSwatchCount').html(rangeCount);
    }

    $("#switch-view-grid").click(function () {
        gridView();
    });

    $("#switch-view-strip").click(function () {
        stripView();
    });

    function gridView() {
        try {
            $('.slick-colour').slick('unslick');
            $(".slick-colour").unbind("afterChange");

        }
        catch (e) {/* ignore as object may not yet be initated */ }

        $("#switch-view-grid").addClass('selected');
        $("#switch-view-strip").removeClass('selected');

        $('.slick-colour').removeClass('slick-colour-strip');
        $('.colour-picker').removeClass('colour-picker-strip');
        swatchLayout.view = 'grid';

        var $status = $('.pagingInfo');
        var $el = $('.slick-colour');

        $el.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
            var i = (currentSlide ? currentSlide : 0) + 1;
            $status.text(i + ' of ' + slick.slideCount);
        });

        $el.slick({
            // lazyLoad: 'progressive',
            infinite: false,
            dots: false,
            rows: 2,
            slidesPerRow: 2,
            mobileFirst: true,
            prevArrow: '<div class="slick-prev slick-arrow" style="display: table;"><i class="fa fa-angle-left fa-2x" aria-hidden="true"></i></div>',
            nextArrow: '<div class="slick-next slick-arrow" style="display: table;"><i class="fa fa-angle-right fa-2x" aria-hidden="true"></i></div>',

            responsive: [
                { breakpoint: 767, settings: { rows: 3, slidesPerRow: 3 } },
                { breakpoint: 992, settings: { rows: 3, slidesPerRow: 4 } },
                { breakpoint: 1280, settings: { rows: 3, slidesPerRow: 6 } }
            ]
        });
        var width = $(window).width();
        var numberOfSlides = 0;
        if (width >= 1280) {
            numberOfSlides = 3 * 6;
        }
        else if (width >= 992) {
            numberOfSlides = 3 * 4;
        }
        else if (width >= 767) {
            numberOfSlides = 3 * 3;
        } else {
            numberOfSlides = 2 * 2;
        }

        var slide = getSelectedSwatchIndex() / numberOfSlides;
        $('.slick-colour').find('[data-index="' + getSelectedSwatchIndex() + '"]').removeClass('active');
        $('.slick-colour').find('[data-index="' + getSelectedSwatchIndex() + '"]').addClass('active');
        $('.slick-colour').slick('slickGoTo', slide, false);
    }

    function getSelectedSwatchIndex() {
        return $.map(rangeData.swatches,
          function (swatch, index) {
              if (swatch.name === selectedSwatch.name) {
                  return index;
              }
          })[0];
    }

    function stripView() {
        $('.slick-colour').find('figure').removeClass('active');
        try {
            $('.slick-colour').slick('unslick');
        }
        catch (e) {/* ignore as object may not yet be initated */ }

        $("#switch-view-strip").addClass('selected');
        $("#switch-view-grid").removeClass('selected');

        $('.slick-colour').addClass('slick-colour-strip');
        $('.colour-picker').addClass('colour-picker-strip');

        swatchLayout.view = 'strip';

        var $status = $('.pagingInfo');
        var $el = $('.slick-colour');

        $el.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
            var i = (currentSlide ? currentSlide : 0) + 1;
            $status.text(i + ' of ' + slick.slideCount);
        });

        $el.slick({
            lazyLoad: 'progressive',
            dots: false,
            centerMode: true,
            variableWidth: true,
            centerPadding: '40px',
            prevArrow: '<div class="slick-prev slick-arrow" style="display: table;"><i class="fa fa-angle-left fa-2x" aria-hidden="true"></i></div>',
            nextArrow: '<div class="slick-next slick-arrow" style="display: table;"><i class="fa fa-angle-right fa-2x" aria-hidden="true"></i></div>',
            customPaging: function (slider, i) {
                return '<i class="fa fa-pagination-static"></i>';
            }
        });
        $el.on('afterChange', function (event, slick, currentSlide) {
            $(".slick-colour [data-slick-index='" + currentSlide + "']").find('a').click();
        });
        $('.slick-colour').find('[data-index="' + getSelectedSwatchIndex() + '"]').removeClass('active');
        $('.slick-colour').slick('slickGoTo', getSelectedSwatchIndex(), false);
    }

    function setUpSlickCarousels() {
        if (swatchLayout.view === 'grid') {
            gridView();
        } else {
            stripView();
        }
        $('.slick-recent').slick(getRecentSlickSettings());
        $('.has-dd a').click(function (e) {
            e.preventDefault();
            $('ul.dd').toggleClass('show');
        });
    }

    function getRecentSlickSettings() {
        return {
            slidesToShow: 1,
            slidesToScroll: 1,
            mobileFirst: true,
            prevArrow:
                '<div class="slick-prev slick-arrow" style="display: table;"><i class="fa fa-angle-left fa-2x" aria-hidden="true"></i></div>',
            nextArrow:
                '<div class="slick-next slick-arrow" style="display: table;"><i class="fa fa-angle-right fa-2x" aria-hidden="true"></i></div>',
            responsive: [
                { breakpoint: 767, settings: { slidesToShow: 2, slidesToScroll: 2 } },
                { breakpoint: 992, settings: { slidesToShow: 3, slidesToScroll: 3 } },
                { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 4 } }
            ]
        };
    }

    function loadConfigHeader() {
        var template = $.templates("#product-configure-template");
        var html = template.render({
            name: selectedVariant.name,
            dimensions: currentSelectedProduct.dimensions,
            scoopImage: currentSelectedProduct.scoopImage,

        });
        return html;
    }

    function loadConfigOptions() {
        var optionTemplate = $.templates("#product-options");
        var optionsHtml = '';
        $.each(selectedVariant.options, function (index, value) {
            if (currentSelectedProduct.options[value.name]) {
                $.each(value.values, function (ine, mango) {
                    if (currentSelectedProduct.options[value.name] === mango.name) {
                        mango.selected = true;
                    }
                });
            }
            optionsHtml += optionTemplate.render({
                optionHeader: value.name,
                numberOfOptions: value.values.length,
                options: value.values,
            });
        });
        optionsHtml += "<div class='summary-container'>{{inject}}</div>";
        return optionsHtml;
    }

    function loadSummary() {
        var summaryTemplate = $.templates("#basket-summary-template");
        var leadWeeks = Math.floor(currentSelectedProduct.leadDays / 7);

        var deliveryDisplay = leadWeeks <= 0 ? currentSelectedProduct.leadDays === 1 ? currentSelectedProduct.leadDays + " day" : currentSelectedProduct.leadDays + " days" :
                                               currentSelectedProduct.leadWeeks === 1 ? leadWeeks + " week" : leadWeeks + " weeks";

        var quantityBox = $('#item-quantity-' + currentActiveConfiguratorSlide);
        var quantity = quantityBox.val() == null ? 1 : parseInt(quantityBox.val(), 10);
        return summaryTemplate.render({
            price: currentSelectedProduct.price * quantity,
            description: currentSelectedProduct.webDescripton,
            delivery: deliveryDisplay,
            quantity: quantity,
            index: currentActiveConfiguratorSlide,
            enableBasket: $("#enable-basket").val()
        });
    }

    function sofologistHeaders(xhr) {
        var auth = JSON.parse(localStorage.getItem("sofologist")) || null;
        var tokenStartTimeStillValid = new Date().setHours(new Date().getHours() - 12);

        if (auth && auth.startDate > tokenStartTimeStillValid) {
            xhr.setRequestHeader("Authorization", auth.token.replace("bearer", "Bearer"));
        } else {
            localStorage.removeItem("sofologist")
        }
    }

    function x(data, index) {
        var enableBasket = $("#enable-basket").val().toLowerCase();
        $.each(data, function (index, value) {
            currentActiveConfiguratorSlide = index;
            selectedVariant = value;
            currentSelectedProduct = $.grep(selectedVariant.products, function (n, i) {
                return n.selected === true;
            })[0];
            var html = '<div><div class="configurator-header">';
            html += loadConfigHeader();
            html += "</div>";
            if (enableBasket == 'true') {
                html += '<div class="config">';
                html += loadConfigOptions();
                html += '</div></div><div>';
                html = html.replace('{{inject}}', loadSummary());
            }
            configuratorActiveSlide().html(html);
        });
        currentActiveConfiguratorSlide = index;
        selectedVariant = data[index];

        currentSelectedProduct = $.grep(selectedVariant.products, function (n, i) {
            return n.selected === true;
        })[0];
        bindQuanityButtons();
        bindCloseButton();
        updateConfigOptionImages();
        currentActiveConfiguratorSlide = index;
      
    }

    function loadSwatchConfigurations(index, swatchName) {
        swatchName = swatchName.replace(/\//g, '__');
        var target = apiRoot + "/range/" + rangeData.name + "/" + swatchName;
        if (cacheData[target]) {
            swatchData = (cacheData[target]);
            x(cacheData[target], index);
        } else {
            $.ajax({ url: target, beforeSend: sofologistHeaders }).done(function (data) {
                cacheData[target] = data;
                swatchData = (cacheData[target]);
                x(data, index);
            });
        }
    }

    function loadConfiguratorForProduct(rangeName, swatchName, index) {
        $('.slick-configure').fadeOut('slow', function() {
            $('.slick-configure-full').fadeIn(1000);
            $('.slick-configure-full').slick('slickGoTo', index, false);
            bindQuanityButtons();
            bindCloseButton();
        });

    }

    function bindCloseButton() {
        $('.close').click(function (e) {
            e.preventDefault();
            $('.slick-configure-full').fadeOut('slow');
            $('.slick-configure').fadeIn('slow');
        });
    }

    function configuratorActiveSlide() {
        return $(".slick-configure-full [data-slick-index='" + currentActiveConfiguratorSlide + "']");
    }

    function bindQuanityButtons() {
        var quantityBox = $('#item-quantity-' + currentActiveConfiguratorSlide);
        

        $('#remove-product-' + currentActiveConfiguratorSlide).click(function () {
            var quantity = parseInt(quantityBox.val(), 10) - 1;
            if (quantity >= 1) {
                quantityBox.val(quantity);
                configuratorActiveSlide().find('.summary-container').html(loadSummary());
                bindQuanityButtons();
            }
        });
        $('#add-product-' + currentActiveConfiguratorSlide).click(function () {
            var quantity = parseInt(quantityBox.val(), 10);
            quantityBox.val(quantity + 1);
            configuratorActiveSlide().find('.summary-container').html(loadSummary());
            bindQuanityButtons();
        });

        $('.slick-configure-full').off('click', '[data-role=add-to-basket]');
        $('.slick-configure-full').on('click', '[data-role=add-to-basket]', function (e) {
            var quantity = parseInt(quantityBox.val(), 10);
            addSelectedProductToBasket(quantity);
            e.preventDefault();
        });
    }

    function addSelectedProductToBasket(quantity) {
        basketModule.addToBasket(currentSelectedProduct.code, quantity);
    }

    function hideBasketDrawer() {
        $('.navigation nav.main .basket-toast:not(.myFocus)').css('display', '').addClass('myBlur');
    }

    function showBasketDrawer(basket) {
        var miniBasketTemplate = _.template($('#mini-basket-template').html());
        var template = miniBasketTemplate({ entries: basket.entries });

        $("header .generic-container").addClass('fixed-header');
        $('.navigation nav.main .basket-toast').show().empty().append(template);
        setTimeout(hideBasketDrawer, 6000);
    }

    var bindDrawerFocus = function () {
        $('.navigation nav.main .basket-toast').on('mouseenter', function () {
            $(this).css('display', '').addClass('myFocus').removeClass('myBlur');
        });
        $('.navigation nav.main .basket-toast').on('mouseleave', function () {
            $(this).css('display', 'block').removeClass('myFocus');
            setTimeout(hideBasketDrawer, 500);
        });

        $('body').on('click', function () {
            $('.navigation nav.main .basket-toast').removeClass('myFocus').addClass('myBlur');
        });
    }();


    function getSelectedOptions() {
        var options = [];
        $.each(configuratorActiveSlide().find('.config__col__item.active'), function (index, value) {
            var item = $(value);
            var selectedGroup = item.attr('data-option-group');
            var selectedOption = item.attr('data-option-value');
            options.push({ selectedGroup: selectedGroup, selectedOption: selectedOption });
        });
        return options;
    }

    function updateConfigOptionImages() {
        var options = getSelectedOptions();
        var next = selectedVariant.optionDetails;
        $.each(options, function (index, value) {
            var match = next[value.selectedOption];
            if (match != null) {
                $('#' + value.selectedGroup).find('img').attr('src', match.scoopImage);
                next = match.options;
            }
        });
    }

    function changeOption(element, group) {
        $.each($('.' + group), function (index, value) {
            configuratorActiveSlide().find(value).removeClass('active');
        });
        $(element).addClass('active');
        var options = getSelectedOptions();
        $.each(selectedVariant.products, function (index, value) {
            var match = false;
            $.each(options, function (index, op) {
                if (op.selectedOption === value.options[op.selectedGroup]) {
                    match = true;
                } else {
                    match = false;
                    return false;
                }
            });
            if (match) {
                currentSelectedProduct = value;
                return false;
            }
        });
        configuratorActiveSlide().find('.configurator-header').html(loadConfigHeader());
        configuratorActiveSlide().find('.summary-container').html(loadSummary());
        updateConfigOptionImages();
    }

    function switchLayout(swatchName) {
        selectedSwatchIndex = $.map(rangeData.swatches,
            function (swatch, index) {
                if (swatch.name === swatchName) {
                    return index;
                }
            })[0];
        stripView();
        $('.configure header h2 span').html(selectedSwatch.name);
        $('.slick-colour').slick('slickGoTo', selectedSwatchIndex, true);
    }

    return {
        init: function (rangeName) {
            getData(rangeName);
        },
        loadConfiguratorForProduct: function (rangeName, swatchName, index) {
            loadConfiguratorForProduct(rangeName, swatchName,  index);
        },
        changeOption: function (element, group) {
            changeOption(element, group);
        },
        loadNewSwatch: function (swatchName, index) {
            loadSelectedSwatchByName(swatchName);
            loadProductsForSelectedSwatch(selectedSwatch);
            if (swatchLayout.view == 'strip') {
                $('.slick-colour').slick('slickGoTo', parseInt(index, 10), true);
            } else {
                $('.slick-colour').find('figure').removeClass('active');
                $('.slick-colour').find('.slick-active').find('[data-index="' + index + '"]').addClass('active');
            }
        },
        switchView: function (swatchName) {
            switchLayout(swatchName);
        },
        showBasketDrawer: function (basket) {
            showBasketDrawer(basket);
        }
    }
})();
