// autocomplete.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-autocomplete", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var active;

    UI.component('autocomplete', {

        defaults: {
            minLength: 3,
            param: 'search',
            method: 'post',
            delay: 300,
            loadingClass: 'uk-loading',
            flipDropdown: false,
            skipClass: 'uk-skip',
            hoverClass: 'uk-active',
            source: null,
            renderer: null,

            // template

            template: '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>'
        },

        visible  : false,
        value    : null,
        selected : null,

        boot: function() {

            // init code
            UI.$html.on("focus.autocomplete.uikit", "[data-uk-autocomplete]", function(e) {

                var ele = UI.$(this);

                if (!ele.data("autocomplete")) {
                    UI.autocomplete(ele, UI.Utils.options(ele.attr("data-uk-autocomplete")));
                }
            });

            // register outer click for autocompletes
            UI.$html.on("click.autocomplete.uikit", function(e) {
                if (active && e.target!=active.input[0]) active.hide();
            });
        },

        init: function() {

            var $this   = this,
                select  = false,
                trigger = UI.Utils.debounce(function(e) {
                    if(select) {
                        return (select = false);
                    }
                    $this.handle();
                }, this.options.delay);


            this.dropdown = this.find('.uk-dropdown');
            this.template = this.find('script[type="text/autocomplete"]').html();
            this.template = UI.Utils.template(this.template || this.options.template);
            this.input    = this.find("input:first").attr("autocomplete", "off");

            if (!this.dropdown.length) {
               this.dropdown = UI.$('<div class="uk-dropdown"></div>').appendTo(this.element);
            }

            if (this.options.flipDropdown) {
                this.dropdown.addClass('uk-dropdown-flip');
            }

            this.dropdown.attr('aria-expanded', 'false');

            this.input.on({
                "keydown": function(e) {

                    if (e && e.which && !e.shiftKey) {

                        switch (e.which) {
                            case 13: // enter
                                select = true;

                                if ($this.selected) {
                                    e.preventDefault();
                                    $this.select();
                                }
                                break;
                            case 38: // up
                                e.preventDefault();
                                $this.pick('prev', true);
                                break;
                            case 40: // down
                                e.preventDefault();
                                $this.pick('next', true);
                                break;
                            case 27:
                            case 9: // esc, tab
                                $this.hide();
                                break;
                            default:
                                break;
                        }
                    }

                },
                "keyup": trigger
            });

            this.dropdown.on("click", ".uk-autocomplete-results > *", function(){
                $this.select();
            });

            this.dropdown.on("mouseover", ".uk-autocomplete-results > *", function(){
                $this.pick(UI.$(this));
            });

            this.triggercomplete = trigger;
        },

        handle: function() {

            var $this = this, old = this.value;

            this.value = this.input.val();

            if (this.value.length < this.options.minLength) return this.hide();

            if (this.value != old) {
                $this.request();
            }

            return this;
        },

        pick: function(item, scrollinview) {

            var $this    = this,
                items    = UI.$(this.dropdown.find('.uk-autocomplete-results').children(':not(.'+this.options.skipClass+')')),
                selected = false;

            if (typeof item !== "string" && !item.hasClass(this.options.skipClass)) {
                selected = item;
            } else if (item == 'next' || item == 'prev') {

                if (this.selected) {
                    var index = items.index(this.selected);

                    if (item == 'next') {
                        selected = items.eq(index + 1 < items.length ? index + 1 : 0);
                    } else {
                        selected = items.eq(index - 1 < 0 ? items.length - 1 : index - 1);
                    }

                } else {
                    selected = items[(item == 'next') ? 'first' : 'last']();
                }

                selected = UI.$(selected);
            }

            if (selected && selected.length) {
                this.selected = selected;
                items.removeClass(this.options.hoverClass);
                this.selected.addClass(this.options.hoverClass);

                // jump to selected if not in view
                if (scrollinview) {

                    var top       = selected.position().top,
                        scrollTop = $this.dropdown.scrollTop(),
                        dpheight  = $this.dropdown.height();

                    if (top > dpheight ||  top < 0) {
                        $this.dropdown.scrollTop(scrollTop + top);
                    }
                }
            }
        },

        select: function() {

            if(!this.selected) return;

            var data = this.selected.data();

            this.trigger("selectitem.uk.autocomplete", [data, this]);

            if (data.value) {
                this.input.val(data.value).trigger('change');
            }

            this.hide();
        },

        show: function() {
            if (this.visible) return;
            this.visible = true;
            this.element.addClass("uk-open");

            if (active && active!==this) {
                active.hide();
            }

            active = this;

            // Update aria
            this.dropdown.attr('aria-expanded', 'true');

            return this;
        },

        hide: function() {
            if (!this.visible) return;
            this.visible = false;
            this.element.removeClass("uk-open");

            if (active === this) {
                active = false;
            }

            // Update aria
            this.dropdown.attr('aria-expanded', 'false');

            return this;
        },

        request: function() {

            var $this   = this,
                release = function(data) {

                    if(data) {
                        $this.render(data);
                    }

                    $this.element.removeClass($this.options.loadingClass);
                };

            this.element.addClass(this.options.loadingClass);

            if (this.options.source) {

                var source = this.options.source;

                switch(typeof(this.options.source)) {
                    case 'function':

                        this.options.source.apply(this, [release]);

                        break;

                    case 'object':

                        if(source.length) {

                            var items = [];

                            source.forEach(function(item){
                                if(item.value && item.value.toLowerCase().indexOf($this.value.toLowerCase())!=-1) {
                                    items.push(item);
                                }
                            });

                            release(items);
                        }

                        break;

                    case 'string':

                        var params ={};

                        params[this.options.param] = this.value;

                        UI.$.ajax({
                            url: this.options.source,
                            data: params,
                            type: this.options.method,
                            dataType: 'json'
                        }).done(function(json) {
                            release(json || []);
                        });

                        break;

                    default:
                        release(null);
                }

            } else {
                this.element.removeClass($this.options.loadingClass);
            }
        },

        render: function(data) {

            this.dropdown.empty();

            this.selected = false;

            if (this.options.renderer) {

                this.options.renderer.apply(this, [data]);

            } else if(data && data.length) {

                this.dropdown.append(this.template({"items":data}));
                this.show();

                this.trigger('show.uk.autocomplete');
            }

            return this;
        }
    });

    return UI.autocomplete;
});


// datepicker.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-datepicker", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    // Datepicker

    var active = false, dropdown, moment;

    UI.component('datepicker', {

        defaults: {
            mobile: false,
            weekstart: 1,
            i18n: {
                months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
                weekdays      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            },
            format: "YYYY-MM-DD",
            offsettop: 5,
            maxDate: false,
            minDate: false,
            pos: 'auto',
            template: function(data, opts) {

                var content = '', i;

                content += '<div class="uk-datepicker-nav">';
                content += '<a href="" class="uk-datepicker-previous"></a>';
                content += '<a href="" class="uk-datepicker-next"></a>';

                if (UI.formSelect) {

                    var currentyear = (new Date()).getFullYear(), options = [], months, years, minYear, maxYear;

                    for (i=0;i<opts.i18n.months.length;i++) {
                        if(i==data.month) {
                            options.push('<option value="'+i+'" selected>'+opts.i18n.months[i]+'</option>');
                        } else {
                            options.push('<option value="'+i+'">'+opts.i18n.months[i]+'</option>');
                        }
                    }

                    months = '<span class="uk-form-select">'+ opts.i18n.months[data.month] + '<select class="update-picker-month">'+options.join('')+'</select></span>';

                    // --

                    options = [];

                    minYear = data.minDate ? data.minDate.year() : currentyear - 50;
                    maxYear = data.maxDate ? data.maxDate.year() : currentyear + 20;

                    for (i=minYear;i<=maxYear;i++) {
                        if (i == data.year) {
                            options.push('<option value="'+i+'" selected>'+i+'</option>');
                        } else {
                            options.push('<option value="'+i+'">'+i+'</option>');
                        }
                    }

                    years  = '<span class="uk-form-select">'+ data.year + '<select class="update-picker-year">'+options.join('')+'</select></span>';

                    content += '<div class="uk-datepicker-heading">'+ months + ' ' + years +'</div>';

                } else {
                    content += '<div class="uk-datepicker-heading">'+ opts.i18n.months[data.month] +' '+ data.year+'</div>';
                }

                content += '</div>';

                content += '<table class="uk-datepicker-table">';
                content += '<thead>';
                for(i = 0; i < data.weekdays.length; i++) {
                    if (data.weekdays[i]) {
                        content += '<th>'+data.weekdays[i]+'</th>';
                    }
                }
                content += '</thead>';

                content += '<tbody>';
                for(i = 0; i < data.days.length; i++) {
                    if (data.days[i] && data.days[i].length){
                        content += '<tr>';
                        for(var d = 0; d < data.days[i].length; d++) {
                            if (data.days[i][d]) {
                                var day = data.days[i][d],
                                    cls = [];

                                if(!day.inmonth) cls.push("uk-datepicker-table-muted");
                                if(day.selected) cls.push("uk-active");
                                if(day.disabled) cls.push('uk-datepicker-date-disabled uk-datepicker-table-muted');

                                content += '<td><a href="" class="'+cls.join(" ")+'" data-date="'+day.day.format()+'">'+day.day.format("D")+'</a></td>';
                            }
                        }
                        content += '</tr>';
                    }
                }
                content += '</tbody>';

                content += '</table>';

                return content;
            }
        },

        boot: function() {

            UI.$win.on("resize orientationchange", function() {

                if (active) {
                    active.hide();
                }
            });

            // init code
            UI.$html.on("focus.datepicker.uikit", "[data-uk-datepicker]", function(e) {

                var ele = UI.$(this);

                if (!ele.data("datepicker")) {
                    e.preventDefault();
                    UI.datepicker(ele, UI.Utils.options(ele.attr("data-uk-datepicker")));
                    ele.trigger("focus");
                }
            });

            UI.$html.on("click focus", '*', function(e) {

                var target = UI.$(e.target);

                if (active && target[0] != dropdown[0] && !target.data("datepicker") && !target.parents(".uk-datepicker:first").length) {
                    active.hide();
                }
            });
        },

        init: function() {

            // use native datepicker on touch devices
            if (UI.support.touch && this.element.attr('type')=='date' && !this.options.mobile) {
                return;
            }

            var $this = this;

            this.current  = this.element.val() ? moment(this.element.val(), this.options.format) : moment();

            this.on("click focus", function(){
                if (active!==$this) $this.pick(this.value ? this.value:($this.options.minDate ? $this.options.minDate :''));
            }).on("change", function(){

                if ($this.element.val() && !moment($this.element.val(), $this.options.format).isValid()) {
                   $this.element.val(moment().format($this.options.format));
                }
            });

            // init dropdown
            if (!dropdown) {

                dropdown = UI.$('<div class="uk-dropdown uk-datepicker"></div>');

                dropdown.on("click", ".uk-datepicker-next, .uk-datepicker-previous, [data-date]", function(e){

                    e.stopPropagation();
                    e.preventDefault();

                    var ele = UI.$(this);

                    if (ele.hasClass('uk-datepicker-date-disabled')) return false;

                    if (ele.is('[data-date]')) {
                        active.current = moment(ele.data("date"));
                        active.element.val(active.current.isValid() ? active.current.format(active.options.format) : null).trigger("change");
                        active.hide();
                    } else {
                       active.add((ele.hasClass("uk-datepicker-next") ? 1:-1), "months");
                    }
                });

                dropdown.on('change', '.update-picker-month, .update-picker-year', function(){

                    var select = UI.$(this);
                    active[select.is('.update-picker-year') ? 'setYear':'setMonth'](Number(select.val()));
                });

                dropdown.appendTo("body");
            }
        },

        pick: function(initdate) {

            var offset = this.element.offset(),
                css    = {"left": offset.left, "right":""};

            this.current  = isNaN(initdate) ? moment(initdate, this.options.format):moment();
            this.initdate = this.current.format("YYYY-MM-DD");

            this.update();

            if (UI.langdirection == 'right') {
                css.right = window.innerWidth - (css.left + this.element.outerWidth());
                css.left  = "";
            }

            var posTop    = (offset.top - this.element.outerHeight() + this.element.height()) - this.options.offsettop - dropdown.outerHeight(),
                posBottom = offset.top + this.element.outerHeight() + this.options.offsettop;

            css.top = posBottom;

            if (this.options.pos == 'top') {
                css.top = posTop;
            } else if(this.options.pos == 'auto' && (window.innerHeight - posBottom - dropdown.outerHeight() < 0 && posTop >= 0) ) {
                css.top = posTop;
            }

            dropdown.css(css).show();
            this.trigger('show.uk.datepicker');

            active = this;
        },

        add: function(unit, value) {
            this.current.add(unit, value);
            this.update();
        },

        setMonth: function(month) {
            this.current.month(month);
            this.update();
        },

        setYear: function(year) {
            this.current.year(year);
            this.update();
        },

        update: function() {

            var data = this.getRows(this.current.year(), this.current.month()),
                tpl  = this.options.template(data, this.options);

            dropdown.html(tpl);

            this.trigger('update.uk.datepicker');
        },

        getRows: function(year, month) {

            var opts   = this.options,
                now    = moment().format('YYYY-MM-DD'),
                days   = [31, (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month],
                before = new Date(year, month, 1, 12).getDay(),
                data   = {"month":month, "year":year,"weekdays":[],"days":[], "maxDate": false, "minDate": false},
                row    = [];

            if (opts.maxDate!==false){
                data.maxDate = isNaN(opts.maxDate) ? moment(opts.maxDate, opts.format) : moment().add(opts.maxDate, 'days');
            }

            if (opts.minDate!==false){
                data.minDate = isNaN(opts.minDate) ? moment(opts.minDate, opts.format) : moment().add(opts.minDate-1, 'days');
            }

            data.weekdays = (function(){

                for (var i=0, arr=[]; i < 7; i++) {

                    var day = i + (opts.weekstart || 0);

                    while (day >= 7) {
                        day -= 7;
                    }

                    arr.push(opts.i18n.weekdays[day]);
                }

                return arr;
            })();

            if (opts.weekstart && opts.weekstart > 0) {
                before -= opts.weekstart;
                if (before < 0) {
                    before += 7;
                }
            }

            var cells = days + before, after = cells;

            while(after > 7) { after -= 7; }

            cells += 7 - after;

            var day, isDisabled, isSelected, isToday, isInMonth;

            for (var i = 0, r = 0; i < cells; i++) {

                day        = new Date(year, month, 1 + (i - before), 12);
                isDisabled = (data.minDate && data.minDate > day) || (data.maxDate && day > data.maxDate);
                isInMonth  = !(i < before || i >= (days + before));

                day = moment(day);

                isSelected = this.initdate == day.format("YYYY-MM-DD");
                isToday    = now == day.format("YYYY-MM-DD");

                row.push({"selected": isSelected, "today": isToday, "disabled": isDisabled, "day":day, "inmonth":isInMonth});

                if (++r === 7) {
                    data.days.push(row);
                    row = [];
                    r = 0;
                }
            }

            return data;
        },

        hide: function() {

            if (active && active === this) {
                dropdown.hide();
                active = false;

                this.trigger('hide.uk.datepicker');
            }
        }
    });

    //! moment.js
    //! version : 2.8.3
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    moment = (function (undefined) {
        /************************************
            Constants
        ************************************/
        var moment,
            VERSION = '2.8.3',
            // the global-scope this is NOT the global object in Node.js
            globalScope = typeof global !== 'undefined' ? global : this,
            oldGlobalMoment,
            round = Math.round,
            hasOwnProperty = Object.prototype.hasOwnProperty,
            i,

            YEAR = 0,
            MONTH = 1,
            DATE = 2,
            HOUR = 3,
            MINUTE = 4,
            SECOND = 5,
            MILLISECOND = 6,

            // internal storage for locale config files
            locales = {},

            // extra moment internal properties (plugins register props here)
            momentProperties = [],

            // check for nodeJS
            hasModule = (typeof module !== 'undefined' && module.exports),

            // ASP.NET json date format regex
            aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
            aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

            // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
            // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
            isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

            // format tokens
            formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
            localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

            // parsing token regexes
            parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
            parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
            parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
            parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
            parseTokenDigits = /\d+/, // nonzero number of digits
            parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
            parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
            parseTokenT = /T/i, // T (ISO separator)
            parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
            parseTokenOrdinal = /\d{1,2}/,

            //strict parsing regexes
            parseTokenOneDigit = /\d/, // 0 - 9
            parseTokenTwoDigits = /\d\d/, // 00 - 99
            parseTokenThreeDigits = /\d{3}/, // 000 - 999
            parseTokenFourDigits = /\d{4}/, // 0000 - 9999
            parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
            parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

            // iso 8601 regex
            // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
            isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

            isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

            isoDates = [
                ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
                ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
                ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
                ['GGGG-[W]WW', /\d{4}-W\d{2}/],
                ['YYYY-DDD', /\d{4}-\d{3}/]
            ],

            // iso time formats and regexes
            isoTimes = [
                ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
                ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
                ['HH:mm', /(T| )\d\d:\d\d/],
                ['HH', /(T| )\d\d/]
            ],

            // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
            parseTimezoneChunker = /([\+\-]|\d\d)/gi,

            // getter and setter names
            proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
            unitMillisecondFactors = {
                'Milliseconds' : 1,
                'Seconds' : 1e3,
                'Minutes' : 6e4,
                'Hours' : 36e5,
                'Days' : 864e5,
                'Months' : 2592e6,
                'Years' : 31536e6
            },

            unitAliases = {
                ms : 'millisecond',
                s : 'second',
                m : 'minute',
                h : 'hour',
                d : 'day',
                D : 'date',
                w : 'week',
                W : 'isoWeek',
                M : 'month',
                Q : 'quarter',
                y : 'year',
                DDD : 'dayOfYear',
                e : 'weekday',
                E : 'isoWeekday',
                gg: 'weekYear',
                GG: 'isoWeekYear'
            },

            camelFunctions = {
                dayofyear : 'dayOfYear',
                isoweekday : 'isoWeekday',
                isoweek : 'isoWeek',
                weekyear : 'weekYear',
                isoweekyear : 'isoWeekYear'
            },

            // format function strings
            formatFunctions = {},

            // default relative time thresholds
            relativeTimeThresholds = {
                s: 45,  // seconds to minute
                m: 45,  // minutes to hour
                h: 22,  // hours to day
                d: 26,  // days to month
                M: 11   // months to year
            },

            // tokens to ordinalize and pad
            ordinalizeTokens = 'DDD w W M D d'.split(' '),
            paddedTokens = 'M D H h m s w W'.split(' '),

            formatTokenFunctions = {
                M    : function () {
                    return this.month() + 1;
                },
                MMM  : function (format) {
                    return this.localeData().monthsShort(this, format);
                },
                MMMM : function (format) {
                    return this.localeData().months(this, format);
                },
                D    : function () {
                    return this.date();
                },
                DDD  : function () {
                    return this.dayOfYear();
                },
                d    : function () {
                    return this.day();
                },
                dd   : function (format) {
                    return this.localeData().weekdaysMin(this, format);
                },
                ddd  : function (format) {
                    return this.localeData().weekdaysShort(this, format);
                },
                dddd : function (format) {
                    return this.localeData().weekdays(this, format);
                },
                w    : function () {
                    return this.week();
                },
                W    : function () {
                    return this.isoWeek();
                },
                YY   : function () {
                    return leftZeroFill(this.year() % 100, 2);
                },
                YYYY : function () {
                    return leftZeroFill(this.year(), 4);
                },
                YYYYY : function () {
                    return leftZeroFill(this.year(), 5);
                },
                YYYYYY : function () {
                    var y = this.year(), sign = y >= 0 ? '+' : '-';
                    return sign + leftZeroFill(Math.abs(y), 6);
                },
                gg   : function () {
                    return leftZeroFill(this.weekYear() % 100, 2);
                },
                gggg : function () {
                    return leftZeroFill(this.weekYear(), 4);
                },
                ggggg : function () {
                    return leftZeroFill(this.weekYear(), 5);
                },
                GG   : function () {
                    return leftZeroFill(this.isoWeekYear() % 100, 2);
                },
                GGGG : function () {
                    return leftZeroFill(this.isoWeekYear(), 4);
                },
                GGGGG : function () {
                    return leftZeroFill(this.isoWeekYear(), 5);
                },
                e : function () {
                    return this.weekday();
                },
                E : function () {
                    return this.isoWeekday();
                },
                a    : function () {
                    return this.localeData().meridiem(this.hours(), this.minutes(), true);
                },
                A    : function () {
                    return this.localeData().meridiem(this.hours(), this.minutes(), false);
                },
                H    : function () {
                    return this.hours();
                },
                h    : function () {
                    return this.hours() % 12 || 12;
                },
                m    : function () {
                    return this.minutes();
                },
                s    : function () {
                    return this.seconds();
                },
                S    : function () {
                    return toInt(this.milliseconds() / 100);
                },
                SS   : function () {
                    return leftZeroFill(toInt(this.milliseconds() / 10), 2);
                },
                SSS  : function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                SSSS : function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                Z    : function () {
                    var a = -this.zone(),
                        b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
                },
                ZZ   : function () {
                    var a = -this.zone(),
                        b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
                },
                z : function () {
                    return this.zoneAbbr();
                },
                zz : function () {
                    return this.zoneName();
                },
                X    : function () {
                    return this.unix();
                },
                Q : function () {
                    return this.quarter();
                }
            },

            deprecations = {},

            lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

        // Pick the first defined of two or three arguments. dfl comes from
        // default.
        function dfl(a, b, c) {
            switch (arguments.length) {
                case 2: return a != null ? a : b;
                case 3: return a != null ? a : b != null ? b : c;
                default: throw new Error('Implement me');
            }
        }

        function hasOwnProp(a, b) {
            return hasOwnProperty.call(a, b);
        }

        function defaultParsingFlags() {
            // We need to deep clone this object, and es5 standard is not very
            // helpful.
            return {
                empty : false,
                unusedTokens : [],
                unusedInput : [],
                overflow : -2,
                charsLeftOver : 0,
                nullInput : false,
                invalidMonth : null,
                invalidFormat : false,
                userInvalidated : false,
                iso: false
            };
        }

        function printMsg(msg) {
            if (moment.suppressDeprecationWarnings === false &&
                    typeof console !== 'undefined' && console.warn) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;
            return extend(function () {
                if (firstTime) {
                    printMsg(msg);
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        function deprecateSimple(name, msg) {
            if (!deprecations[name]) {
                printMsg(msg);
                deprecations[name] = true;
            }
        }

        function padToken(func, count) {
            return function (a) {
                return leftZeroFill(func.call(this, a), count);
            };
        }
        function ordinalizeToken(func, period) {
            return function (a) {
                return this.localeData().ordinal(func.call(this, a), period);
            };
        }

        while (ordinalizeTokens.length) {
            i = ordinalizeTokens.pop();
            formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
        }
        while (paddedTokens.length) {
            i = paddedTokens.pop();
            formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
        }
        formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


        /************************************
            Constructors
        ************************************/

        function Locale() {
        }

        // Moment prototype object
        function Moment(config, skipOverflow) {
            if (skipOverflow !== false) {
                checkOverflow(config);
            }
            copyConfig(this, config);
            this._d = new Date(+config._d);
        }

        // Duration Constructor
        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            // representation for dateAddRemove
            this._milliseconds = +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 36e5; // 1000 * 60 * 60
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days +
                weeks * 7;
            // It is impossible translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months +
                quarters * 3 +
                years * 12;

            this._data = {};

            this._locale = moment.localeData();

            this._bubble();
        }

        /************************************
            Helpers
        ************************************/


        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function copyConfig(to, from) {
            var i, prop, val;

            if (typeof from._isAMomentObject !== 'undefined') {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (typeof from._i !== 'undefined') {
                to._i = from._i;
            }
            if (typeof from._f !== 'undefined') {
                to._f = from._f;
            }
            if (typeof from._l !== 'undefined') {
                to._l = from._l;
            }
            if (typeof from._strict !== 'undefined') {
                to._strict = from._strict;
            }
            if (typeof from._tzm !== 'undefined') {
                to._tzm = from._tzm;
            }
            if (typeof from._isUTC !== 'undefined') {
                to._isUTC = from._isUTC;
            }
            if (typeof from._offset !== 'undefined') {
                to._offset = from._offset;
            }
            if (typeof from._pf !== 'undefined') {
                to._pf = from._pf;
            }
            if (typeof from._locale !== 'undefined') {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i in momentProperties) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (typeof val !== 'undefined') {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        function absRound(number) {
            if (number < 0) {
                return Math.ceil(number);
            } else {
                return Math.floor(number);
            }
        }

        // left zero fill a number
        // see http://jsperf.com/left-zero-filling for performance comparison
        function leftZeroFill(number, targetLength, forceSign) {
            var output = '' + Math.abs(number),
                sign = number >= 0;

            while (output.length < targetLength) {
                output = '0' + output;
            }
            return (sign ? (forceSign ? '+' : '') : '-') + output;
        }

        function positiveMomentsDifference(base, other) {
            var res = {milliseconds: 0, months: 0};

            res.months = other.month() - base.month() +
                (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            other = makeAs(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                    tmp = val; val = period; period = tmp;
                }

                val = typeof val === 'string' ? +val : val;
                dur = moment.duration(val, period);
                addOrSubtractDurationFromMoment(this, dur, direction);
                return this;
            };
        }

        function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = duration._days,
                months = duration._months;
            updateOffset = updateOffset == null ? true : updateOffset;

            if (milliseconds) {
                mom._d.setTime(+mom._d + milliseconds * isAdding);
            }
            if (days) {
                rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
            }
            if (months) {
                rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
            }
            if (updateOffset) {
                moment.updateOffset(mom, days || months);
            }
        }

        // check if is an array
        function isArray(input) {
            return Object.prototype.toString.call(input) === '[object Array]';
        }

        function isDate(input) {
            return Object.prototype.toString.call(input) === '[object Date]' ||
                input instanceof Date;
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if ((dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        function normalizeUnits(units) {
            if (units) {
                var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
                units = unitAliases[units] || camelFunctions[lowered] || lowered;
            }
            return units;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        function makeList(field) {
            var count, setter;

            if (field.indexOf('week') === 0) {
                count = 7;
                setter = 'day';
            }
            else if (field.indexOf('month') === 0) {
                count = 12;
                setter = 'month';
            }
            else {
                return;
            }

            moment[field] = function (format, index) {
                var i, getter,
                    method = moment._locale[field],
                    results = [];

                if (typeof format === 'number') {
                    index = format;
                    format = undefined;
                }

                getter = function (i) {
                    var m = moment().utc().set(setter, i);
                    return method.call(moment._locale, m, format || '');
                };

                if (index != null) {
                    return getter(index);
                }
                else {
                    for (i = 0; i < count; i++) {
                        results.push(getter(i));
                    }
                    return results;
                }
            };
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                if (coercedNumber >= 0) {
                    value = Math.floor(coercedNumber);
                } else {
                    value = Math.ceil(coercedNumber);
                }
            }

            return value;
        }

        function daysInMonth(year, month) {
            return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        }

        function weeksInYear(year, dow, doy) {
            return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
        }

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        function checkOverflow(m) {
            var overflow;
            if (m._a && m._pf.overflow === -2) {
                overflow =
                    m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                    m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                    m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                    m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                    m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                    m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                    -1;

                if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }

                m._pf.overflow = overflow;
            }
        }

        function isValid(m) {
            if (m._isValid == null) {
                m._isValid = !isNaN(m._d.getTime()) &&
                    m._pf.overflow < 0 &&
                    !m._pf.empty &&
                    !m._pf.invalidMonth &&
                    !m._pf.nullInput &&
                    !m._pf.invalidFormat &&
                    !m._pf.userInvalidated;

                if (m._strict) {
                    m._isValid = m._isValid &&
                        m._pf.charsLeftOver === 0 &&
                        m._pf.unusedTokens.length === 0;
                }
            }
            return m._isValid;
        }

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0, j, next, locale, split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return null;
        }

        function loadLocale(name) {
            var oldLocale = null;
            if (!locales[name] && hasModule) {
                try {
                    oldLocale = moment.locale();
                    require('./locale/' + name);
                    // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                    moment.locale(oldLocale);
                } catch (e) { }
            }
            return locales[name];
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function makeAs(input, model) {
            return model._isUTC ? moment(input).zone(model._offset || 0) :
                moment(input).local();
        }

        /************************************
            Locale
        ************************************/


        extend(Locale.prototype, {

            set : function (config) {
                var prop, i;
                for (i in config) {
                    prop = config[i];
                    if (typeof prop === 'function') {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            },

            _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            months : function (m) {
                return this._months[m.month()];
            },

            _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            monthsShort : function (m) {
                return this._monthsShort[m.month()];
            },

            monthsParse : function (monthName) {
                var i, mom, regex;

                if (!this._monthsParse) {
                    this._monthsParse = [];
                }

                for (i = 0; i < 12; i++) {
                    // make the regex if we don't have it already
                    if (!this._monthsParse[i]) {
                        mom = moment.utc([2000, i]);
                        regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                        this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    // test the regex
                    if (this._monthsParse[i].test(monthName)) {
                        return i;
                    }
                }
            },

            _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdays : function (m) {
                return this._weekdays[m.day()];
            },

            _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysShort : function (m) {
                return this._weekdaysShort[m.day()];
            },

            _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            weekdaysMin : function (m) {
                return this._weekdaysMin[m.day()];
            },

            weekdaysParse : function (weekdayName) {
                var i, mom, regex;

                if (!this._weekdaysParse) {
                    this._weekdaysParse = [];
                }

                for (i = 0; i < 7; i++) {
                    // make the regex if we don't have it already
                    if (!this._weekdaysParse[i]) {
                        mom = moment([2000, 1]).day(i);
                        regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                        this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    // test the regex
                    if (this._weekdaysParse[i].test(weekdayName)) {
                        return i;
                    }
                }
            },

            _longDateFormat : {
                LT : 'h:mm A',
                L : 'MM/DD/YYYY',
                LL : 'MMMM D, YYYY',
                LLL : 'MMMM D, YYYY LT',
                LLLL : 'dddd, MMMM D, YYYY LT'
            },
            longDateFormat : function (key) {
                var output = this._longDateFormat[key];
                if (!output && this._longDateFormat[key.toUpperCase()]) {
                    output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                        return val.slice(1);
                    });
                    this._longDateFormat[key] = output;
                }
                return output;
            },

            isPM : function (input) {
                // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
                // Using charAt should be more compatible.
                return ((input + '').toLowerCase().charAt(0) === 'p');
            },

            _meridiemParse : /[ap]\.?m?\.?/i,
            meridiem : function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'pm' : 'PM';
                } else {
                    return isLower ? 'am' : 'AM';
                }
            },

            _calendar : {
                sameDay : '[Today at] LT',
                nextDay : '[Tomorrow at] LT',
                nextWeek : 'dddd [at] LT',
                lastDay : '[Yesterday at] LT',
                lastWeek : '[Last] dddd [at] LT',
                sameElse : 'L'
            },
            calendar : function (key, mom) {
                var output = this._calendar[key];
                return typeof output === 'function' ? output.apply(mom) : output;
            },

            _relativeTime : {
                future : 'in %s',
                past : '%s ago',
                s : 'a few seconds',
                m : 'a minute',
                mm : '%d minutes',
                h : 'an hour',
                hh : '%d hours',
                d : 'a day',
                dd : '%d days',
                M : 'a month',
                MM : '%d months',
                y : 'a year',
                yy : '%d years'
            },

            relativeTime : function (number, withoutSuffix, string, isFuture) {
                var output = this._relativeTime[string];
                return (typeof output === 'function') ?
                    output(number, withoutSuffix, string, isFuture) :
                    output.replace(/%d/i, number);
            },

            pastFuture : function (diff, output) {
                var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
                return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
            },

            ordinal : function (number) {
                return this._ordinal.replace('%d', number);
            },
            _ordinal : '%d',

            preparse : function (string) {
                return string;
            },

            postformat : function (string) {
                return string;
            },

            week : function (mom) {
                return weekOfYear(mom, this._week.dow, this._week.doy).week;
            },

            _week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            },

            _invalidDate: 'Invalid date',
            invalidDate: function () {
                return this._invalidDate;
            }
        });

        /************************************
            Formatting
        ************************************/


        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens), i, length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '';
                for (i = 0; i < length; i++) {
                    output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());

            if (!formatFunctions[format]) {
                formatFunctions[format] = makeFormatFunction(format);
            }

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }


        /************************************
            Parsing
        ************************************/


        // get the regex to find the next token
        function getParseRegexForToken(token, config) {
            var a, strict = config._strict;
            switch (token) {
            case 'Q':
                return parseTokenOneDigit;
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
                /* falls through */
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
                /* falls through */
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
                /* falls through */
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return config._locale._meridiemParse;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            case 'Do':
                return parseTokenOrdinal;
            default :
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
                return a;
            }
        }

        function timezoneMinutesFromString(string) {
            string = string || '';
            var possibleTzMatches = (string.match(parseTokenTimezone) || []),
                tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
                parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
                minutes = +(parts[1] * 60) + toInt(parts[2]);

            return parts[0] === '+' ? -minutes : minutes;
        }

        // function to convert string input to date
        function addTimeToArrayFromToken(token, input, config) {
            var a, datePartArray = config._a;

            switch (token) {
            // QUARTER
            case 'Q':
                if (input != null) {
                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
                }
                break;
            // MONTH
            case 'M' : // fall through to MM
            case 'MM' :
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM' : // fall through to MMMM
            case 'MMMM' :
                a = config._locale.monthsParse(input);
                // if we didn't find a month name, mark the date as invalid.
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            // DAY OF MONTH
            case 'D' : // fall through to DD
            case 'DD' :
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            case 'Do' :
                if (input != null) {
                    datePartArray[DATE] = toInt(parseInt(input, 10));
                }
                break;
            // DAY OF YEAR
            case 'DDD' : // fall through to DDDD
            case 'DDDD' :
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }

                break;
            // YEAR
            case 'YY' :
                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
                break;
            case 'YYYY' :
            case 'YYYYY' :
            case 'YYYYYY' :
                datePartArray[YEAR] = toInt(input);
                break;
            // AM / PM
            case 'a' : // fall through to A
            case 'A' :
                config._isPm = config._locale.isPM(input);
                break;
            // 24 HOUR
            case 'H' : // fall through to hh
            case 'HH' : // fall through to hh
            case 'h' : // fall through to hh
            case 'hh' :
                datePartArray[HOUR] = toInt(input);
                break;
            // MINUTE
            case 'm' : // fall through to mm
            case 'mm' :
                datePartArray[MINUTE] = toInt(input);
                break;
            // SECOND
            case 's' : // fall through to ss
            case 'ss' :
                datePartArray[SECOND] = toInt(input);
                break;
            // MILLISECOND
            case 'S' :
            case 'SS' :
            case 'SSS' :
            case 'SSSS' :
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            // UNIX TIMESTAMP WITH MS
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            // TIMEZONE
            case 'Z' : // fall through to ZZ
            case 'ZZ' :
                config._useUTC = true;
                config._tzm = timezoneMinutesFromString(input);
                break;
            // WEEKDAY - human
            case 'dd':
            case 'ddd':
            case 'dddd':
                a = config._locale.weekdaysParse(input);
                // if we didn't get a weekday name, mark the date as invalid
                if (a != null) {
                    config._w = config._w || {};
                    config._w['d'] = a;
                } else {
                    config._pf.invalidWeekday = input;
                }
                break;
            // WEEK, WEEK DAY - numeric
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
                /* falls through */
            case 'gggg':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = toInt(input);
                }
                break;
            case 'gg':
            case 'GG':
                config._w = config._w || {};
                config._w[token] = moment.parseTwoDigitYear(input);
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
                week = dfl(w.W, 1);
                weekday = dfl(w.E, 1);
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
                week = dfl(w.w, 1);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < dow) {
                        ++week;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from begining of week
                    weekday = w.e + dow;
                } else {
                    // default to begining of week
                    weekday = dow;
                }
            }
            temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function dateFromConfig(config) {
            var i, date, input = [], currentDate, yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear) {
                yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

                if (config._dayOfYear > daysInYear(yearToUse)) {
                    config._pf._overflowDayOfYear = true;
                }

                date = makeUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
            }

            config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
            // Apply timezone offset from input. The actual zone can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
            }
        }

        function dateFromObject(config) {
            var normalizedInput;

            if (config._d) {
                return;
            }

            normalizedInput = normalizeObjectUnits(config._i);
            config._a = [
                normalizedInput.year,
                normalizedInput.month,
                normalizedInput.day,
                normalizedInput.hour,
                normalizedInput.minute,
                normalizedInput.second,
                normalizedInput.millisecond
            ];

            dateFromConfig(config);
        }

        function currentDateArray(config) {
            var now = new Date();
            if (config._useUTC) {
                return [
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                ];
            } else {
                return [now.getFullYear(), now.getMonth(), now.getDate()];
            }
        }

        // date from string and format string
        function makeDateFromStringAndFormat(config) {
            if (config._f === moment.ISO_8601) {
                parseISO(config);
                return;
            }

            config._a = [];
            config._pf.empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i, parsedInput, tokens, token, skipped,
                stringLength = string.length,
                totalParsedInputLength = 0;

            tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        config._pf.unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        config._pf.empty = false;
                    }
                    else {
                        config._pf.unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                }
                else if (config._strict && !parsedInput) {
                    config._pf.unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            config._pf.charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                config._pf.unusedInput.push(string);
            }

            // handle am pm
            if (config._isPm && config._a[HOUR] < 12) {
                config._a[HOUR] += 12;
            }
            // if is 12 am, change hours to 0
            if (config._isPm === false && config._a[HOUR] === 12) {
                config._a[HOUR] = 0;
            }

            dateFromConfig(config);
            checkOverflow(config);
        }

        function unescapeFormat(s) {
            return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            });
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function regexpEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        // date from string and array of format strings
        function makeDateFromStringAndArray(config) {
            var tempConfig,
                bestMoment,

                scoreToBeat,
                i,
                currentScore;

            if (config._f.length === 0) {
                config._pf.invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._pf = defaultParsingFlags();
                tempConfig._f = config._f[i];
                makeDateFromStringAndFormat(tempConfig);

                if (!isValid(tempConfig)) {
                    continue;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += tempConfig._pf.charsLeftOver;

                //or tokens
                currentScore += tempConfig._pf.unusedTokens.length * 10;

                tempConfig._pf.score = currentScore;

                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        // date from iso format
        function parseISO(config) {
            var i, l,
                string = config._i,
                match = isoRegex.exec(string);

            if (match) {
                config._pf.iso = true;
                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(string)) {
                        // match[5] should be 'T' or undefined
                        config._f = isoDates[i][0] + (match[6] || ' ');
                        break;
                    }
                }
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(string)) {
                        config._f += isoTimes[i][0];
                        break;
                    }
                }
                if (string.match(parseTokenTimezone)) {
                    config._f += 'Z';
                }
                makeDateFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        // date from iso format or fallback
        function makeDateFromString(config) {
            parseISO(config);
            if (config._isValid === false) {
                delete config._isValid;
                moment.createFromInputFallback(config);
            }
        }

        function map(arr, fn) {
            var res = [], i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function makeDateFromInput(config) {
            var input = config._i, matched;
            if (input === undefined) {
                config._d = new Date();
            } else if (isDate(input)) {
                config._d = new Date(+input);
            } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
                config._d = new Date(+matched[1]);
            } else if (typeof input === 'string') {
                makeDateFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                dateFromConfig(config);
            } else if (typeof(input) === 'object') {
                dateFromObject(config);
            } else if (typeof(input) === 'number') {
                // from milliseconds
                config._d = new Date(input);
            } else {
                moment.createFromInputFallback(config);
            }
        }

        function makeDate(y, m, d, h, M, s, ms) {
            //can't just apply() to create a date:
            //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
            var date = new Date(y, m, d, h, M, s, ms);

            //the date constructor doesn't accept years < 1970
            if (y < 1970) {
                date.setFullYear(y);
            }
            return date;
        }

        function makeUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));
            if (y < 1970) {
                date.setUTCFullYear(y);
            }
            return date;
        }

        function parseWeekday(input, locale) {
            if (typeof input === 'string') {
                if (!isNaN(input)) {
                    input = parseInt(input, 10);
                }
                else {
                    input = locale.weekdaysParse(input);
                    if (typeof input !== 'number') {
                        return null;
                    }
                }
            }
            return input;
        }

        /************************************
            Relative Time
        ************************************/


        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime(posNegDuration, withoutSuffix, locale) {
            var duration = moment.duration(posNegDuration).abs(),
                seconds = round(duration.as('s')),
                minutes = round(duration.as('m')),
                hours = round(duration.as('h')),
                days = round(duration.as('d')),
                months = round(duration.as('M')),
                years = round(duration.as('y')),

                args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                    minutes === 1 && ['m'] ||
                    minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                    hours === 1 && ['h'] ||
                    hours < relativeTimeThresholds.h && ['hh', hours] ||
                    days === 1 && ['d'] ||
                    days < relativeTimeThresholds.d && ['dd', days] ||
                    months === 1 && ['M'] ||
                    months < relativeTimeThresholds.M && ['MM', months] ||
                    years === 1 && ['y'] || ['yy', years];

            args[2] = withoutSuffix;
            args[3] = +posNegDuration > 0;
            args[4] = locale;
            return substituteTimeAgo.apply({}, args);
        }


        /************************************
            Week of Year
        ************************************/


        // firstDayOfWeek       0 = sun, 6 = sat
        //                      the day of the week that starts the week
        //                      (usually sunday or monday)
        // firstDayOfWeekOfYear 0 = sun, 6 = sat
        //                      the first week is the week that contains the first
        //                      of this day of the week
        //                      (eg. ISO weeks use thursday (4))
        function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
            var end = firstDayOfWeekOfYear - firstDayOfWeek,
                daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
                adjustedMoment;


            if (daysToDayOfWeek > end) {
                daysToDayOfWeek -= 7;
            }

            if (daysToDayOfWeek < end - 7) {
                daysToDayOfWeek += 7;
            }

            adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
            return {
                week: Math.ceil(adjustedMoment.dayOfYear() / 7),
                year: adjustedMoment.year()
            };
        }

        //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
            var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

            d = d === 0 ? 7 : d;
            weekday = weekday != null ? weekday : firstDayOfWeek;
            daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
            dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

            return {
                year: dayOfYear > 0 ? year : year - 1,
                dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
            };
        }

        /************************************
            Top Level Functions
        ************************************/

        function makeMoment(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || moment.localeData(config._l);

            if (input === null || (format === undefined && input === '')) {
                return moment.invalid({nullInput: true});
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (moment.isMoment(input)) {
                return new Moment(input, true);
            } else if (format) {
                if (isArray(format)) {
                    makeDateFromStringAndArray(config);
                } else {
                    makeDateFromStringAndFormat(config);
                }
            } else {
                makeDateFromInput(config);
            }

            return new Moment(config);
        }

        moment = function (input, format, locale, strict) {
            var c;

            if (typeof(locale) === 'boolean') {
                strict = locale;
                locale = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c = {};
            c._isAMomentObject = true;
            c._i = input;
            c._f = format;
            c._l = locale;
            c._strict = strict;
            c._isUTC = false;
            c._pf = defaultParsingFlags();

            return makeMoment(c);
        };

        moment.suppressDeprecationWarnings = false;

        moment.createFromInputFallback = deprecate(
            'moment construction falls back to js Date. This is ' +
            'discouraged and will be removed in upcoming major ' +
            'release. Please refer to ' +
            'https://github.com/moment/moment/issues/1407 for more info.',
            function (config) {
                config._d = new Date(config._i);
            }
        );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return moment();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        moment.min = function () {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        };

        moment.max = function () {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        };

        // creating with utc
        moment.utc = function (input, format, locale, strict) {
            var c;

            if (typeof(locale) === 'boolean') {
                strict = locale;
                locale = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c = {};
            c._isAMomentObject = true;
            c._useUTC = true;
            c._isUTC = true;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;
            c._pf = defaultParsingFlags();

            return makeMoment(c).utc();
        };

        // creating with unix timestamp (in seconds)
        moment.unix = function (input) {
            return moment(input * 1000);
        };

        // duration
        moment.duration = function (input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                parseIso,
                diffRes;

            if (moment.isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months
                };
            } else if (typeof input === 'number') {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(match[MILLISECOND]) * sign
                };
            } else if (!!(match = isoDurationRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : 1;
                parseIso = function (inp) {
                    // We'd normally use ~~inp for this, but unfortunately it also
                    // converts floats to ints.
                    // inp may be undefined, so careful calling replace on it.
                    var res = inp && parseFloat(inp.replace(',', '.'));
                    // apply sign while we're at it
                    return (isNaN(res) ? 0 : res) * sign;
                };
                duration = {
                    y: parseIso(match[2]),
                    M: parseIso(match[3]),
                    d: parseIso(match[4]),
                    h: parseIso(match[5]),
                    m: parseIso(match[6]),
                    s: parseIso(match[7]),
                    w: parseIso(match[8])
                };
            } else if (typeof duration === 'object' &&
                    ('from' in duration || 'to' in duration)) {
                diffRes = momentsDifference(moment(duration.from), moment(duration.to));

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            return ret;
        };

        // version number
        moment.version = VERSION;

        // default format
        moment.defaultFormat = isoFormat;

        // constant that refers to the ISO standard
        moment.ISO_8601 = function () {};

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        moment.momentProperties = momentProperties;

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        moment.updateOffset = function () {};

        // This function allows you to set a threshold for relative time strings
        moment.relativeTimeThreshold = function (threshold, limit) {
            if (relativeTimeThresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return relativeTimeThresholds[threshold];
            }
            relativeTimeThresholds[threshold] = limit;
            return true;
        };

        moment.lang = deprecate(
            'moment.lang is deprecated. Use moment.locale instead.',
            function (key, value) {
                return moment.locale(key, value);
            }
        );

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        moment.locale = function (key, values) {
            var data;
            if (key) {
                if (typeof(values) !== 'undefined') {
                    data = moment.defineLocale(key, values);
                }
                else {
                    data = moment.localeData(key);
                }

                if (data) {
                    moment.duration._locale = moment._locale = data;
                }
            }

            return moment._locale._abbr;
        };

        moment.defineLocale = function (name, values) {
            if (values !== null) {
                values.abbr = name;
                if (!locales[name]) {
                    locales[name] = new Locale();
                }
                locales[name].set(values);

                // backwards compat for now: also set the locale
                moment.locale(name);

                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        };

        moment.langData = deprecate(
            'moment.langData is deprecated. Use moment.localeData instead.',
            function (key) {
                return moment.localeData(key);
            }
        );

        // returns locale data
        moment.localeData = function (key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return moment._locale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        };

        // compare moment object
        moment.isMoment = function (obj) {
            return obj instanceof Moment ||
                (obj != null && hasOwnProp(obj, '_isAMomentObject'));
        };

        // for typechecking Duration objects
        moment.isDuration = function (obj) {
            return obj instanceof Duration;
        };

        for (i = lists.length - 1; i >= 0; --i) {
            makeList(lists[i]);
        }

        moment.normalizeUnits = function (units) {
            return normalizeUnits(units);
        };

        moment.invalid = function (flags) {
            var m = moment.utc(NaN);
            if (flags != null) {
                extend(m._pf, flags);
            }
            else {
                m._pf.userInvalidated = true;
            }

            return m;
        };

        moment.parseZone = function () {
            return moment.apply(null, arguments).parseZone();
        };

        moment.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        /************************************
            Moment Prototype
        ************************************/


        extend(moment.fn = Moment.prototype, {

            clone : function () {
                return moment(this);
            },

            valueOf : function () {
                return +this._d + ((this._offset || 0) * 60000);
            },

            unix : function () {
                return Math.floor(+this / 1000);
            },

            toString : function () {
                return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
            },

            toDate : function () {
                return this._offset ? new Date(+this) : this._d;
            },

            toISOString : function () {
                var m = moment(this).utc();
                if (0 < m.year() && m.year() <= 9999) {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                } else {
                    return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            },

            toArray : function () {
                var m = this;
                return [
                    m.year(),
                    m.month(),
                    m.date(),
                    m.hours(),
                    m.minutes(),
                    m.seconds(),
                    m.milliseconds()
                ];
            },

            isValid : function () {
                return isValid(this);
            },

            isDSTShifted : function () {
                if (this._a) {
                    return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
                }

                return false;
            },

            parsingFlags : function () {
                return extend({}, this._pf);
            },

            invalidAt: function () {
                return this._pf.overflow;
            },

            utc : function (keepLocalTime) {
                return this.zone(0, keepLocalTime);
            },

            local : function (keepLocalTime) {
                if (this._isUTC) {
                    this.zone(0, keepLocalTime);
                    this._isUTC = false;

                    if (keepLocalTime) {
                        this.add(this._dateTzOffset(), 'm');
                    }
                }
                return this;
            },

            format : function (inputString) {
                var output = formatMoment(this, inputString || moment.defaultFormat);
                return this.localeData().postformat(output);
            },

            add : createAdder(1, 'add'),

            subtract : createAdder(-1, 'subtract'),

            diff : function (input, units, asFloat) {
                var that = makeAs(input, this),
                    zoneDiff = (this.zone() - that.zone()) * 6e4,
                    diff, output, daysAdjust;

                units = normalizeUnits(units);

                if (units === 'year' || units === 'month') {
                    // average number of days in the months in the given dates
                    diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                    // difference in months
                    output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                    // adjust by taking difference in days, average number of days
                    // and dst in the given months.
                    daysAdjust = (this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'));
                    // same as above but with zones, to negate all dst
                    daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                            (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                    output += daysAdjust / diff;
                    if (units === 'year') {
                        output = output / 12;
                    }
                } else {
                    diff = (this - that);
                    output = units === 'second' ? diff / 1e3 : // 1000
                        units === 'minute' ? diff / 6e4 : // 1000 * 60
                        units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                        units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                        units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                        diff;
                }
                return asFloat ? output : absRound(output);
            },

            from : function (time, withoutSuffix) {
                return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
            },

            fromNow : function (withoutSuffix) {
                return this.from(moment(), withoutSuffix);
            },

            calendar : function (time) {
                // We want to compare the start of today, vs this.
                // Getting start-of-today depends on whether we're zone'd or not.
                var now = time || moment(),
                    sod = makeAs(now, this).startOf('day'),
                    diff = this.diff(sod, 'days', true),
                    format = diff < -6 ? 'sameElse' :
                        diff < -1 ? 'lastWeek' :
                        diff < 0 ? 'lastDay' :
                        diff < 1 ? 'sameDay' :
                        diff < 2 ? 'nextDay' :
                        diff < 7 ? 'nextWeek' : 'sameElse';
                return this.format(this.localeData().calendar(format, this));
            },

            isLeapYear : function () {
                return isLeapYear(this.year());
            },

            isDST : function () {
                return (this.zone() < this.clone().month(0).zone() ||
                    this.zone() < this.clone().month(5).zone());
            },

            day : function (input) {
                var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                if (input != null) {
                    input = parseWeekday(input, this.localeData());
                    return this.add(input - day, 'd');
                } else {
                    return day;
                }
            },

            month : makeAccessor('Month', true),

            startOf : function (units) {
                units = normalizeUnits(units);
                // the following switch intentionally omits break keywords
                // to utilize falling through the cases.
                switch (units) {
                case 'year':
                    this.month(0);
                    /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                    /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                    /* falls through */
                case 'hour':
                    this.minutes(0);
                    /* falls through */
                case 'minute':
                    this.seconds(0);
                    /* falls through */
                case 'second':
                    this.milliseconds(0);
                    /* falls through */
                }

                // weeks are a special case
                if (units === 'week') {
                    this.weekday(0);
                } else if (units === 'isoWeek') {
                    this.isoWeekday(1);
                }

                // quarters are also special
                if (units === 'quarter') {
                    this.month(Math.floor(this.month() / 3) * 3);
                }

                return this;
            },

            endOf: function (units) {
                units = normalizeUnits(units);
                return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
            },

            isAfter: function (input, units) {
                units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
                if (units === 'millisecond') {
                    input = moment.isMoment(input) ? input : moment(input);
                    return +this > +input;
                } else {
                    return +this.clone().startOf(units) > +moment(input).startOf(units);
                }
            },

            isBefore: function (input, units) {
                units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
                if (units === 'millisecond') {
                    input = moment.isMoment(input) ? input : moment(input);
                    return +this < +input;
                } else {
                    return +this.clone().startOf(units) < +moment(input).startOf(units);
                }
            },

            isSame: function (input, units) {
                units = normalizeUnits(units || 'millisecond');
                if (units === 'millisecond') {
                    input = moment.isMoment(input) ? input : moment(input);
                    return +this === +input;
                } else {
                    return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
                }
            },

            min: deprecate(
                     'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                     function (other) {
                         other = moment.apply(null, arguments);
                         return other < this ? this : other;
                     }
             ),

            max: deprecate(
                    'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                    function (other) {
                        other = moment.apply(null, arguments);
                        return other > this ? this : other;
                    }
            ),

            // keepLocalTime = true means only change the timezone, without
            // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
            // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
            // +0200, so we adjust the time as needed, to be valid.
            //
            // Keeping the time actually adds/subtracts (one hour)
            // from the actual represented time. That is why we call updateOffset
            // a second time. In case it wants us to change the offset again
            // _changeInProgress == true case, then we have to adjust, because
            // there is no such time in the given timezone.
            zone : function (input, keepLocalTime) {
                var offset = this._offset || 0,
                    localAdjust;
                if (input != null) {
                    if (typeof input === 'string') {
                        input = timezoneMinutesFromString(input);
                    }
                    if (Math.abs(input) < 16) {
                        input = input * 60;
                    }
                    if (!this._isUTC && keepLocalTime) {
                        localAdjust = this._dateTzOffset();
                    }
                    this._offset = input;
                    this._isUTC = true;
                    if (localAdjust != null) {
                        this.subtract(localAdjust, 'm');
                    }
                    if (offset !== input) {
                        if (!keepLocalTime || this._changeInProgress) {
                            addOrSubtractDurationFromMoment(this,
                                    moment.duration(offset - input, 'm'), 1, false);
                        } else if (!this._changeInProgress) {
                            this._changeInProgress = true;
                            moment.updateOffset(this, true);
                            this._changeInProgress = null;
                        }
                    }
                } else {
                    return this._isUTC ? offset : this._dateTzOffset();
                }
                return this;
            },

            zoneAbbr : function () {
                return this._isUTC ? 'UTC' : '';
            },

            zoneName : function () {
                return this._isUTC ? 'Coordinated Universal Time' : '';
            },

            parseZone : function () {
                if (this._tzm) {
                    this.zone(this._tzm);
                } else if (typeof this._i === 'string') {
                    this.zone(this._i);
                }
                return this;
            },

            hasAlignedHourOffset : function (input) {
                if (!input) {
                    input = 0;
                }
                else {
                    input = moment(input).zone();
                }

                return (this.zone() - input) % 60 === 0;
            },

            daysInMonth : function () {
                return daysInMonth(this.year(), this.month());
            },

            dayOfYear : function (input) {
                var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
                return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
            },

            quarter : function (input) {
                return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
            },

            weekYear : function (input) {
                var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
                return input == null ? year : this.add((input - year), 'y');
            },

            isoWeekYear : function (input) {
                var year = weekOfYear(this, 1, 4).year;
                return input == null ? year : this.add((input - year), 'y');
            },

            week : function (input) {
                var week = this.localeData().week(this);
                return input == null ? week : this.add((input - week) * 7, 'd');
            },

            isoWeek : function (input) {
                var week = weekOfYear(this, 1, 4).week;
                return input == null ? week : this.add((input - week) * 7, 'd');
            },

            weekday : function (input) {
                var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
                return input == null ? weekday : this.add(input - weekday, 'd');
            },

            isoWeekday : function (input) {
                // behaves the same as moment#day except
                // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
                // as a setter, sunday should belong to the previous week.
                return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
            },

            isoWeeksInYear : function () {
                return weeksInYear(this.year(), 1, 4);
            },

            weeksInYear : function () {
                var weekInfo = this.localeData()._week;
                return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
            },

            get : function (units) {
                units = normalizeUnits(units);
                return this[units]();
            },

            set : function (units, value) {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
                return this;
            },

            // If passed a locale key, it will set the locale for this
            // instance.  Otherwise, it will return the locale configuration
            // variables for this instance.
            locale : function (key) {
                var newLocaleData;

                if (key === undefined) {
                    return this._locale._abbr;
                } else {
                    newLocaleData = moment.localeData(key);
                    if (newLocaleData != null) {
                        this._locale = newLocaleData;
                    }
                    return this;
                }
            },

            lang : deprecate(
                'moment().lang() is deprecated. Use moment().localeData() instead.',
                function (key) {
                    if (key === undefined) {
                        return this.localeData();
                    } else {
                        return this.locale(key);
                    }
                }
            ),

            localeData : function () {
                return this._locale;
            },

            _dateTzOffset : function () {
                // On Firefox.24 Date#getTimezoneOffset returns a floating point.
                // https://github.com/moment/moment/pull/1871
                return Math.round(this._d.getTimezoneOffset() / 15) * 15;
            }
        });

        function rawMonthSetter(mom, value) {
            var dayOfMonth;

            // TODO: Move this out of here!
            if (typeof value === 'string') {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }

            dayOfMonth = Math.min(mom.date(),
                    daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function rawGetter(mom, unit) {
            return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
        }

        function rawSetter(mom, unit, value) {
            if (unit === 'Month') {
                return rawMonthSetter(mom, value);
            } else {
                return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }

        function makeAccessor(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    rawSetter(this, unit, value);
                    moment.updateOffset(this, keepTime);
                    return this;
                } else {
                    return rawGetter(this, unit);
                }
            };
        }

        moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
        moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
        moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
        // Setting the hour should keep the time, because the user explicitly
        // specified which hour he wants. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
        // moment.fn.month is defined separately
        moment.fn.date = makeAccessor('Date', true);
        moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
        moment.fn.year = makeAccessor('FullYear', true);
        moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

        // add plural methods
        moment.fn.days = moment.fn.day;
        moment.fn.months = moment.fn.month;
        moment.fn.weeks = moment.fn.week;
        moment.fn.isoWeeks = moment.fn.isoWeek;
        moment.fn.quarters = moment.fn.quarter;

        // add aliased format methods
        moment.fn.toJSON = moment.fn.toISOString;

        /************************************
            Duration Prototype
        ************************************/


        function daysToYears (days) {
            // 400 years have 146097 days (taking into account leap year rules)
            return days * 400 / 146097;
        }

        function yearsToDays (years) {
            // years * 365 + absRound(years / 4) -
            //     absRound(years / 100) + absRound(years / 400);
            return years * 146097 / 400;
        }

        extend(moment.duration.fn = Duration.prototype, {

            _bubble : function () {
                var milliseconds = this._milliseconds,
                    days = this._days,
                    months = this._months,
                    data = this._data,
                    seconds, minutes, hours, years = 0;

                // The following code bubbles up values, see the tests for
                // examples of what that means.
                data.milliseconds = milliseconds % 1000;

                seconds = absRound(milliseconds / 1000);
                data.seconds = seconds % 60;

                minutes = absRound(seconds / 60);
                data.minutes = minutes % 60;

                hours = absRound(minutes / 60);
                data.hours = hours % 24;

                days += absRound(hours / 24);

                // Accurately convert days to years, assume start from year 0.
                years = absRound(daysToYears(days));
                days -= absRound(yearsToDays(years));

                // 30 days to a month
                // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
                months += absRound(days / 30);
                days %= 30;

                // 12 months -> 1 year
                years += absRound(months / 12);
                months %= 12;

                data.days = days;
                data.months = months;
                data.years = years;
            },

            abs : function () {
                this._milliseconds = Math.abs(this._milliseconds);
                this._days = Math.abs(this._days);
                this._months = Math.abs(this._months);

                this._data.milliseconds = Math.abs(this._data.milliseconds);
                this._data.seconds = Math.abs(this._data.seconds);
                this._data.minutes = Math.abs(this._data.minutes);
                this._data.hours = Math.abs(this._data.hours);
                this._data.months = Math.abs(this._data.months);
                this._data.years = Math.abs(this._data.years);

                return this;
            },

            weeks : function () {
                return absRound(this.days() / 7);
            },

            valueOf : function () {
                return this._milliseconds +
                  this._days * 864e5 +
                  (this._months % 12) * 2592e6 +
                  toInt(this._months / 12) * 31536e6;
            },

            humanize : function (withSuffix) {
                var output = relativeTime(this, !withSuffix, this.localeData());

                if (withSuffix) {
                    output = this.localeData().pastFuture(+this, output);
                }

                return this.localeData().postformat(output);
            },

            add : function (input, val) {
                // supports only 2.0-style add(1, 's') or add(moment)
                var dur = moment.duration(input, val);

                this._milliseconds += dur._milliseconds;
                this._days += dur._days;
                this._months += dur._months;

                this._bubble();

                return this;
            },

            subtract : function (input, val) {
                var dur = moment.duration(input, val);

                this._milliseconds -= dur._milliseconds;
                this._days -= dur._days;
                this._months -= dur._months;

                this._bubble();

                return this;
            },

            get : function (units) {
                units = normalizeUnits(units);
                return this[units.toLowerCase() + 's']();
            },

            as : function (units) {
                var days, months;
                units = normalizeUnits(units);

                if (units === 'month' || units === 'year') {
                    days = this._days + this._milliseconds / 864e5;
                    months = this._months + daysToYears(days) * 12;
                    return units === 'month' ? months : months / 12;
                } else {
                    // handle milliseconds separately because of floating point math errors (issue #1867)
                    days = this._days + yearsToDays(this._months / 12);
                    switch (units) {
                        case 'week': return days / 7 + this._milliseconds / 6048e5;
                        case 'day': return days + this._milliseconds / 864e5;
                        case 'hour': return days * 24 + this._milliseconds / 36e5;
                        case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                        case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                        // Math.floor prevents floating point math errors here
                        case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                        default: throw new Error('Unknown unit ' + units);
                    }
                }
            },

            lang : moment.fn.lang,
            locale : moment.fn.locale,

            toIsoString : deprecate(
                'toIsoString() is deprecated. Please use toISOString() instead ' +
                '(notice the capitals)',
                function () {
                    return this.toISOString();
                }
            ),

            toISOString : function () {
                // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
                var years = Math.abs(this.years()),
                    months = Math.abs(this.months()),
                    days = Math.abs(this.days()),
                    hours = Math.abs(this.hours()),
                    minutes = Math.abs(this.minutes()),
                    seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

                if (!this.asSeconds()) {
                    // this is the same as C#'s (Noda) and python (isodate)...
                    // but not other JS (goog.date)
                    return 'P0D';
                }

                return (this.asSeconds() < 0 ? '-' : '') +
                    'P' +
                    (years ? years + 'Y' : '') +
                    (months ? months + 'M' : '') +
                    (days ? days + 'D' : '') +
                    ((hours || minutes || seconds) ? 'T' : '') +
                    (hours ? hours + 'H' : '') +
                    (minutes ? minutes + 'M' : '') +
                    (seconds ? seconds + 'S' : '');
            },

            localeData : function () {
                return this._locale;
            }
        });

        moment.duration.fn.toString = moment.duration.fn.toISOString;

        function makeDurationGetter(name) {
            moment.duration.fn[name] = function () {
                return this._data[name];
            };
        }

        for (i in unitMillisecondFactors) {
            if (hasOwnProp(unitMillisecondFactors, i)) {
                makeDurationGetter(i.toLowerCase());
            }
        }

        moment.duration.fn.asMilliseconds = function () {
            return this.as('ms');
        };
        moment.duration.fn.asSeconds = function () {
            return this.as('s');
        };
        moment.duration.fn.asMinutes = function () {
            return this.as('m');
        };
        moment.duration.fn.asHours = function () {
            return this.as('h');
        };
        moment.duration.fn.asDays = function () {
            return this.as('d');
        };
        moment.duration.fn.asWeeks = function () {
            return this.as('weeks');
        };
        moment.duration.fn.asMonths = function () {
            return this.as('M');
        };
        moment.duration.fn.asYears = function () {
            return this.as('y');
        };

        /************************************
            Default Locale
        ************************************/


        // Set default locale, other locale will inherit from English.
        moment.locale('en', {
            ordinal : function (number) {
                var b = number % 10,
                    output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
                return number + output;
            }
        });

        return moment;

    }).call(this);

    UI.Utils.moment = moment;

    return UI.datepicker;
});







// form-password.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-form-password", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('formPassword', {

        defaults: {
            "lblShow": "Show",
            "lblHide": "Hide"
        },

        boot: function() {
            // init code
            UI.$html.on("click.formpassword.uikit", "[data-uk-form-password]", function(e) {

                var ele = UI.$(this);

                if (!ele.data("formPassword")) {

                    e.preventDefault();

                    UI.formPassword(ele, UI.Utils.options(ele.attr("data-uk-form-password")));
                    ele.trigger("click");
                }
            });
        },

        init: function() {

            var $this = this;

            this.on("click", function(e) {

                e.preventDefault();

                if($this.input.length) {
                    var type = $this.input.attr("type");
                    $this.input.attr("type", type=="text" ? "password":"text");
                    $this.element.html($this.options[type=="text" ? "lblShow":"lblHide"]);
                }
            });

            this.input = this.element.next("input").length ? this.element.next("input") : this.element.prev("input");
            this.element.html(this.options[this.input.is("[type='password']") ? "lblShow":"lblHide"]);


            this.element.data("formPassword", this);
        }
    });

    return UI.formPassword;
});




// form-select.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-form-select", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('formSelect', {

        defaults: {
            'target': '>span:first',
            'activeClass': 'uk-active'
        },

        boot: function() {
            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-form-select]", context).each(function(){

                    var ele = UI.$(this);

                    if (!ele.data("formSelect")) {
                        UI.formSelect(ele, UI.Utils.options(ele.attr("data-uk-form-select")));
                    }
                });
            });
        },

        init: function() {
            var $this = this;

            this.target  = this.find(this.options.target);
            this.select  = this.find('select');

            // init + on change event
            this.select.on("change", (function(){

                var select = $this.select[0], fn = function(){

                    try {
                        if($this.options.target === 'input')
                        {
                            $this.target.val(select.options[select.selectedIndex].text);
                        }
                        else
                        {
                            $this.target.text(select.options[select.selectedIndex].text);
                        }
                    } catch(e) {}

                    $this.element[$this.select.val() ? 'addClass':'removeClass']($this.options.activeClass);

                    return fn;
                };

                return fn();
            })());

            this.element.data("formSelect", this);
        }
    });

    return UI.formSelect;
});




// grid.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-grid", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('grid', {

        defaults: {
            colwidth  : 'auto',
            animation : true,
            duration  : 300,
            gutter    : 0,
            controls  : false,
            filter    : false
        },

        boot:  function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-grid]', context).each(function(){

                    var ele = UI.$(this);

                    if(!ele.data("grid")) {
                        UI.grid(ele, UI.Utils.options(ele.attr('data-uk-grid')));
                    }
                });
            });
        },

        init: function() {

            var $this = this, gutter = String(this.options.gutter).trim().split(' ');

            this.gutterv  = parseInt(gutter[0], 10);
            this.gutterh  = parseInt((gutter[1] || gutter[0]), 10);

            // make sure parent element has the right position property
            this.element.css({'position': 'relative'});

            this.controls = null;

            if (this.options.controls) {

                this.controls = UI.$(this.options.controls);

                // filter
                this.controls.on('click', '[data-uk-filter]', function(e){
                    e.preventDefault();
                    $this.filter(UI.$(this).attr('data-uk-filter'));
                });

                // sort
                this.controls.on('click', '[data-uk-sort]', function(e){
                    e.preventDefault();
                    var cmd = UI.$(this).attr('data-uk-sort').split(':');
                    $this.sort(cmd[0], cmd[1]);
                });
            }

            UI.$win.on('load resize orientationchange', UI.Utils.debounce(function(){

                if ($this.currentfilter) {
                    $this.filter($this.currentfilter);
                } else {
                    this.updateLayout();
                }

            }.bind(this), 100));

            this.on('display.uk.check', function(){
                if ($this.element.is(":visible"))  $this.updateLayout();
            });

            UI.domObserve(this.element, function(e) {
                $this.updateLayout();
            });

            if (this.options.filter !== false) {
                this.filter(this.options.filter);
            } else {
                this.updateLayout();
            }
        },

        _prepareElements: function() {

            var children = this.element.children(':not([data-grid-prepared])'), css;

            // exit if no already prepared elements found
            if (!children.length) {
                return;
            }

            css = {
                'position'   : 'absolute',
                'box-sizing' : 'border-box',
                'width'      : this.options.colwidth == 'auto' ? '' : this.options.colwidth
            };

            if (this.options.gutter) {

                css['padding-left']   = this.gutterh;
                css['padding-bottom'] = this.gutterv;

                this.element.css('margin-left', this.gutterh * -1);
            }

            children.attr('data-grid-prepared', 'true').css(css);
        },

        updateLayout: function(elements) {

            this._prepareElements();

            elements = elements || this.element.children(':visible');

            var children  = elements,
                maxwidth  = this.element.width() + (2*this.gutterh) + 2,
                left      = 0,
                top       = 0,
                positions = [],

                item, width, height, pos, i, z, max, size;

            this.trigger('beforeupdate.uk.grid', [children]);

            children.each(function(index){

                size   = getElementSize(this);

                item   = UI.$(this);
                width  = size.outerWidth;
                height = size.outerHeight;
                left   = 0;
                top    = 0;

                for (i=0,max=positions.length;i<max;i++) {

                    pos = positions[i];

                    if (left <= pos.aX) { left = pos.aX; }
                    if (maxwidth < (left + width)) { left = 0; }
                    if (top <= pos.aY) { top = pos.aY; }
                }

                positions.push({
                    "ele"    : item,
                    "top"    : top,
                    "left"   : left,
                    "width"  : width,
                    "height" : height,
                    "aY"     : (top  + height),
                    "aX"     : (left + width)
                });
            });

            var posPrev, maxHeight = 0;

            // fix top
            for (i=0,max=positions.length;i<max;i++) {

                pos = positions[i];
                top = 0;

                for (z=0;z<i;z++) {

                    posPrev = positions[z];

                    // (posPrev.left + 1) fixex 1px bug when using % based widths
                    if (pos.left < posPrev.aX && (posPrev.left +1) < pos.aX) {
                        top = posPrev.aY;
                    }
                }

                pos.top = top;
                pos.aY  = top + pos.height;

                maxHeight = Math.max(maxHeight, pos.aY);
            }

            maxHeight = maxHeight - this.gutterv;

            if (this.options.animation) {

                this.element.stop().animate({'height': maxHeight}, 100);

                positions.forEach(function(pos){
                    pos.ele.stop().animate({"top": pos.top, "left": pos.left, opacity: 1}, this.options.duration);
                }.bind(this));

            } else {

                this.element.css('height', maxHeight);

                positions.forEach(function(pos){
                    pos.ele.css({"top": pos.top, "left": pos.left, opacity: 1});
                }.bind(this));
            }

            // make sure to trigger possible scrollpies etc.
            setTimeout(function() {
                UI.$doc.trigger('scrolling.uk.document');
            }, 2 * this.options.duration * (this.options.animation ? 1:0));

            this.trigger('afterupdate.uk.grid', [children]);
        },

        filter: function(filter) {

            this.currentfilter = filter;

            filter = filter || [];

            if (typeof(filter) === 'number') {
                filter = filter.toString();
            }

            if (typeof(filter) === 'string') {
                filter = filter.split(/,/).map(function(item){ return item.trim(); });
            }

            var $this = this, children = this.element.children(), elements = {"visible": [], "hidden": []}, visible, hidden;

            children.each(function(index){

                var ele = UI.$(this), f = ele.attr('data-uk-filter'), infilter = filter.length ? false : true;

                if (f) {

                    f = f.split(/,/).map(function(item){ return item.trim(); });

                    filter.forEach(function(item){
                        if (f.indexOf(item) > -1) infilter = true;
                    });
                }

                elements[infilter ? "visible":"hidden"].push(ele);
            });

            // convert to jQuery collections
            elements.hidden  = UI.$(elements.hidden).map(function () {return this[0];});
            elements.visible = UI.$(elements.visible).map(function () {return this[0];});

            elements.hidden.attr('aria-hidden', 'true').filter(':visible').fadeOut(this.options.duration);
            elements.visible.attr('aria-hidden', 'false').filter(':hidden').css('opacity', 0).show();

            $this.updateLayout(elements.visible);

            if (this.controls && this.controls.length) {
                this.controls.find('[data-uk-filter]').removeClass('uk-active').filter('[data-uk-filter="'+filter+'"]').addClass('uk-active');
            }
        },

        sort: function(by, order){

            order = order || 1;

            // covert from string (asc|desc) to number
            if (typeof(order) === 'string') {
                order = order.toLowerCase() == 'desc' ? -1 : 1;
            }

            var elements = this.element.children();

            elements.sort(function(a, b){

                a = UI.$(a);
                b = UI.$(b);

                return (b.data(by) || '') < (a.data(by) || '') ? order : (order*-1);

            }).appendTo(this.element);

            this.updateLayout(elements.filter(':visible'));

            if (this.controls && this.controls.length) {
                this.controls.find('[data-uk-sort]').removeClass('uk-active').filter('[data-uk-sort="'+by+':'+(order == -1 ? 'desc':'asc')+'"]').addClass('uk-active');
            }
        }
    });


    /*!
    * getSize v1.2.2
    * measure size of elements
    * MIT license
    * https://github.com/desandro/get-size
    */
    var _getSize = (function(){

        var prefixes = 'Webkit Moz ms Ms O'.split(' ');
        var docElemStyle = document.documentElement.style;

        function getStyleProperty( propName ) {
            if ( !propName ) {
                return;
            }

            // test standard property first
            if ( typeof docElemStyle[ propName ] === 'string' ) {
                return propName;
            }

            // capitalize
            propName = propName.charAt(0).toUpperCase() + propName.slice(1);

            // test vendor specific properties
            var prefixed;
            for ( var i=0, len = prefixes.length; i < len; i++ ) {
                prefixed = prefixes[i] + propName;
                if ( typeof docElemStyle[ prefixed ] === 'string' ) {
                    return prefixed;
                }
            }
        }

        // -------------------------- helpers -------------------------- //

        // get a number from a string, not a percentage
        function getStyleSize( value ) {
            var num = parseFloat( value );
            // not a percent like '100%', and a number
            var isValid = value.indexOf('%') === -1 && !isNaN( num );
            return isValid && num;
        }

        function noop() {}

        var logError = typeof console === 'undefined' ? noop : function( message ) {
            console.error( message );
        };

        // -------------------------- measurements -------------------------- //

        var measurements = [
            'paddingLeft',
            'paddingRight',
            'paddingTop',
            'paddingBottom',
            'marginLeft',
            'marginRight',
            'marginTop',
            'marginBottom',
            'borderLeftWidth',
            'borderRightWidth',
            'borderTopWidth',
            'borderBottomWidth'
        ];

        function getZeroSize() {
            var size = {
                width: 0,
                height: 0,
                innerWidth: 0,
                innerHeight: 0,
                outerWidth: 0,
                outerHeight: 0
            };
            for ( var i=0, len = measurements.length; i < len; i++ ) {
                var measurement = measurements[i];
                size[ measurement ] = 0;
            }
            return size;
        }


        // -------------------------- setup -------------------------- //

        var isSetup = false;
        var getStyle, boxSizingProp, isBoxSizeOuter;

        /**
        * setup vars and functions
        * do it on initial getSize(), rather than on script load
        * For Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        */
        function setup() {
            // setup once
            if ( isSetup ) {
                return;
            }
            isSetup = true;

            var getComputedStyle = window.getComputedStyle;
            getStyle = ( function() {
                var getStyleFn = getComputedStyle ?
                function( elem ) {
                    return getComputedStyle( elem, null );
                } :
                function( elem ) {
                    return elem.currentStyle;
                };

                return function getStyle( elem ) {
                    var style = getStyleFn( elem );
                    if ( !style ) {
                        logError( 'Style returned ' + style +
                        '. Are you running this code in a hidden iframe on Firefox? ' +
                        'See http://bit.ly/getsizebug1' );
                    }
                    return style;
                };
            })();

            // -------------------------- box sizing -------------------------- //

            boxSizingProp = getStyleProperty('boxSizing');

            /**
            * WebKit measures the outer-width on style.width on border-box elems
            * IE & Firefox measures the inner-width
            */
            if ( boxSizingProp ) {
                var div = document.createElement('div');
                div.style.width = '200px';
                div.style.padding = '1px 2px 3px 4px';
                div.style.borderStyle = 'solid';
                div.style.borderWidth = '1px 2px 3px 4px';
                div.style[ boxSizingProp ] = 'border-box';

                var body = document.body || document.documentElement;
                body.appendChild( div );
                var style = getStyle( div );

                isBoxSizeOuter = getStyleSize( style.width ) === 200;
                body.removeChild( div );
            }

        }

        // -------------------------- getSize -------------------------- //

        function getSize( elem ) {
            setup();

            // use querySeletor if elem is string
            if ( typeof elem === 'string' ) {
                elem = document.querySelector( elem );
            }

            // do not proceed on non-objects
            if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
                return;
            }

            var style = getStyle( elem );

            // if hidden, everything is 0
            if ( style.display === 'none' ) {
                return getZeroSize();
            }

            var size = {};
            size.width = elem.offsetWidth;
            size.height = elem.offsetHeight;

            var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
                style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

            // get all measurements
            for ( var i=0, len = measurements.length; i < len; i++ ) {
                var measurement = measurements[i];
                var value = style[ measurement ];

                var num = parseFloat( value );
                // any 'auto', 'medium' value will be 0
                size[ measurement ] = !isNaN( num ) ? num : 0;
            }

            var paddingWidth = size.paddingLeft + size.paddingRight;
            var paddingHeight = size.paddingTop + size.paddingBottom;
            var marginWidth = size.marginLeft + size.marginRight;
            var marginHeight = size.marginTop + size.marginBottom;
            var borderWidth = size.borderLeftWidth + size.borderRightWidth;
            var borderHeight = size.borderTopWidth + size.borderBottomWidth;

            var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

            // overwrite width and height if we can get it from style
            var styleWidth = getStyleSize( style.width );
            if ( styleWidth !== false ) {
                size.width = styleWidth +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
            }

            var styleHeight = getStyleSize( style.height );
            if ( styleHeight !== false ) {
                size.height = styleHeight +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
            }

            size.innerWidth = size.width - ( paddingWidth + borderWidth );
            size.innerHeight = size.height - ( paddingHeight + borderHeight );

            size.outerWidth = size.width + marginWidth;
            size.outerHeight = size.height + marginHeight;

            return size;
        }

        return getSize;

    })();

    function getElementSize(ele) {
        return _getSize(ele);
    }
});




// pagination.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
/*
 * Based on simplePagination - Copyright (c) 2012 Flavius Matis - http://flaviusmatis.github.com/simplePagination.js/ (MIT)
 */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-pagination", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    UI.component('pagination', {

        defaults: {
            items          : 1,
            itemsOnPage    : 1,
            pages          : 0,
            displayedPages : 7,
            edges          : 1,
            currentPage    : 0,
            lblPrev        : false,
            lblNext        : false,
            onSelectPage   : function() {}
        },

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$("[data-uk-pagination]", context).each(function(){
                    var ele = UI.$(this);

                    if (!ele.data("pagination")) {
                        UI.pagination(ele, UI.Utils.options(ele.attr("data-uk-pagination")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.pages         = this.options.pages ?  this.options.pages : Math.ceil(this.options.items / this.options.itemsOnPage) ? Math.ceil(this.options.items / this.options.itemsOnPage) : 1;
            this.currentPage   = this.options.currentPage;
            this.halfDisplayed = this.options.displayedPages / 2;

            this.on("click", "a[data-page]", function(e){
                e.preventDefault();
                $this.selectPage(UI.$(this).data("page"));
            });

            this._render();
        },

        _getInterval: function() {

            return {
                start: Math.ceil(this.currentPage > this.halfDisplayed ? Math.max(Math.min(this.currentPage - this.halfDisplayed, (this.pages - this.options.displayedPages)), 0) : 0),
                end  : Math.ceil(this.currentPage > this.halfDisplayed ? Math.min(this.currentPage + this.halfDisplayed, this.pages) : Math.min(this.options.displayedPages, this.pages))
            };
        },

        render: function(pages) {
            this.pages = pages ? pages : this.pages;
            this._render();
        },

        selectPage: function(pageIndex, pages) {
            this.currentPage = pageIndex;
            this.render(pages);

            this.options.onSelectPage.apply(this, [pageIndex]);
            this.trigger('select.uk.pagination', [pageIndex, this]);
        },

        _render: function() {

            var o = this.options, interval = this._getInterval(), i;

            this.element.empty();

            // Generate Prev link
            if (o.lblPrev) this._append(this.currentPage - 1, {text: o.lblPrev});

            // Generate start edges
            if (interval.start > 0 && o.edges > 0) {

                var end = Math.min(o.edges, interval.start);

                for (i = 0; i < end; i++) this._append(i);

                if (o.edges < interval.start && (interval.start - o.edges != 1)) {
                    this.element.append('<li><span>...</span></li>');
                } else if (interval.start - o.edges == 1) {
                    this._append(o.edges);
                }
            }

            // Generate interval links
            for (i = interval.start; i < interval.end; i++) this._append(i);

            // Generate end edges
            if (interval.end < this.pages && o.edges > 0) {

                if (this.pages - o.edges > interval.end && (this.pages - o.edges - interval.end != 1)) {
                    this.element.append('<li><span>...</span></li>');
                } else if (this.pages - o.edges - interval.end == 1) {
                    this._append(interval.end++);
                }

                var begin = Math.max(this.pages - o.edges, interval.end);

                for (i = begin; i < this.pages; i++) this._append(i);
            }

            // Generate Next link (unless option is set for at front)
            if (o.lblNext) this._append(this.currentPage + 1, {text: o.lblNext});
        },

        _append: function(pageIndex, opts) {

            var item, options;

            pageIndex = pageIndex < 0 ? 0 : (pageIndex < this.pages ? pageIndex : this.pages - 1);
            options   = UI.$.extend({ text: pageIndex + 1 }, opts);

            item = (pageIndex == this.currentPage) ? '<li class="uk-active"><span>' + (options.text) + '</span></li>' : '<li><a href="#page-'+(pageIndex+1)+'" data-page="'+pageIndex+'">'+options.text+'</a></li>';

            this.element.append(item);
        }
    });

    return UI.pagination;
});




// slider.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-slider", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var dragging, delayIdle, anchor, dragged, store = {};

    UI.component('slider', {

        defaults: {
            center           : false,
            threshold        : 10,
            infinite         : true,
            autoplay         : false,
            autoplayInterval : 7000,
            pauseOnHover     : true,
            activecls        : 'uk-active'
        },

        boot:  function() {

            // init code
            UI.ready(function(context) {

                setTimeout(function(){

                    UI.$('[data-uk-slider]', context).each(function(){

                        var ele = UI.$(this);

                        if (!ele.data('slider')) {
                            UI.slider(ele, UI.Utils.options(ele.attr('data-uk-slider')));
                        }
                    });

                }, 0);
            });
        },

        init: function() {

            var $this = this;

            this.container = this.element.find('.uk-slider');
            this.focus     = 0;

            UI.$win.on('resize load', UI.Utils.debounce(function() {
                $this.resize(true);
            }, 100));

            this.on('click.uk.slider', '[data-uk-slider-item]', function(e) {

                e.preventDefault();

                var item = UI.$(this).attr('data-uk-slider-item');

                if ($this.focus == item) return;

                // stop autoplay
                $this.stop();

                switch(item) {
                    case 'next':
                    case 'previous':
                        $this[item=='next' ? 'next':'previous']();
                        break;
                    default:
                        $this.updateFocus(parseInt(item, 10));
                }
            });

            this.container.on({

                'touchstart mousedown': function(evt) {

                    if (evt.originalEvent && evt.originalEvent.touches) {
                        evt = evt.originalEvent.touches[0];
                    }

                    // ignore right click button
                    if (evt.button && evt.button==2 || !$this.active) {
                        return;
                    }

                    // stop autoplay
                    $this.stop();

                    anchor  = UI.$(evt.target).is('a') ? UI.$(evt.target) : UI.$(evt.target).parents('a:first');
                    dragged = false;

                    if (anchor.length) {

                        anchor.one('click', function(e){
                            if (dragged) e.preventDefault();
                        });
                    }

                    delayIdle = function(e) {

                        dragged  = true;
                        dragging = $this;
                        store    = {
                            touchx : parseInt(e.pageX, 10),
                            dir    : 1,
                            focus  : $this.focus,
                            base   : $this.options.center ? 'center':'area'
                        };

                        if (e.originalEvent && e.originalEvent.touches) {
                            e = e.originalEvent.touches[0];
                        }

                        dragging.element.data({
                            'pointer-start': {x: parseInt(e.pageX, 10), y: parseInt(e.pageY, 10)},
                            'pointer-pos-start': $this.pos
                        });

                        $this.container.addClass('uk-drag');

                        delayIdle = false;
                    };

                    delayIdle.x         = parseInt(evt.pageX, 10);
                    delayIdle.threshold = $this.options.threshold;

                },

                mouseenter: function() { if ($this.options.pauseOnHover) $this.hovering = true;  },
                mouseleave: function() { $this.hovering = false; }
            });

            this.resize(true);

            this.on('display.uk.check', function(){
                if ($this.element.is(":visible")) {
                    $this.resize(true);
                }
            });

            // prevent dragging links + images
            this.element.find('a,img').attr('draggable', 'false');

            // Set autoplay
            if (this.options.autoplay) {
                this.start();
            }

        },

        resize: function(focus) {

            var $this = this, pos = 0, maxheight = 0, item, width, cwidth, size;

            this.items = this.container.children().filter(':visible');
            this.vp    = this.element[0].getBoundingClientRect().width;

            this.container.css({'min-width': '', 'min-height': ''});

            this.items.each(function(idx){

                item      = UI.$(this);
                size      = item.css({'left': '', 'width':''})[0].getBoundingClientRect();
                width     = size.width;
                cwidth    = item.width();
                maxheight = Math.max(maxheight, size.height);

                item.css({'left': pos, 'width':width}).data({'idx':idx, 'left': pos, 'width': width, 'cwidth':cwidth, 'area': (pos+width), 'center':(pos - ($this.vp/2 - cwidth/2))});

                pos += width;
            });

            this.container.css({'min-width': pos, 'min-height': maxheight});

            if (this.options.infinite && (pos <= (2*this.vp) || this.items.length < 5) && !this.itemsResized) {

                // fill with cloned items
                this.container.children().each(function(idx){
                   $this.container.append($this.items.eq(idx).clone(true).attr('id', ''));
                }).each(function(idx){
                   $this.container.append($this.items.eq(idx).clone(true).attr('id', ''));
                });

                this.itemsResized = true;

                return this.resize();
            }

            this.cw     = pos;
            this.pos    = 0;
            this.active = pos >= this.vp;

            this.container.css({
                '-ms-transform': '',
                '-webkit-transform': '',
                'transform': ''
            });

            if (focus) this.updateFocus(this.focus);
        },

        updatePos: function(pos) {
            this.pos = pos;
            this.container.css({
                '-ms-transform': 'translateX('+pos+'px)',
                '-webkit-transform': 'translateX('+pos+'px)',
                'transform': 'translateX('+pos+'px)'
            });
        },

        updateFocus: function(idx, dir) {

            if (!this.active) {
                return;
            }

            dir = dir || (idx > this.focus ? 1:-1);

            var item = this.items.eq(idx), area, i;

            if (this.options.infinite) {
                this.infinite(idx, dir);
            }

            if (this.options.center) {

                this.updatePos(item.data('center')*-1);

                this.items.filter('.'+this.options.activecls).removeClass(this.options.activecls);
                item.addClass(this.options.activecls);

            } else {

                if (this.options.infinite) {

                    this.updatePos(item.data('left')*-1);

                } else {

                    area = 0;

                    for (i=idx;i<this.items.length;i++) {
                        area += this.items.eq(i).data('width');
                    }


                    if (area > this.vp) {

                        this.updatePos(item.data('left')*-1);

                    } else {

                        if (dir == 1) {

                            area = 0;

                            for (i=this.items.length-1;i>=0;i--) {

                                area += this.items.eq(i).data('width');

                                if (area == this.vp) {
                                    idx = i;
                                    break;
                                }

                                if (area > this.vp) {
                                    idx = (i < this.items.length-1) ? i+1 : i;
                                    break;
                                }
                            }

                            if (area > this.vp) {
                                this.updatePos((this.container.width() - this.vp) * -1);
                            } else {
                                this.updatePos(this.items.eq(idx).data('left')*-1);
                            }
                        }
                    }
                }
            }

            // mark elements
            var left = this.items.eq(idx).data('left');

            this.items.removeClass('uk-slide-before uk-slide-after').each(function(i){
                if (i!==idx) {
                    UI.$(this).addClass(UI.$(this).data('left') < left ? 'uk-slide-before':'uk-slide-after');
                }
            });

            this.focus = idx;

            this.trigger('focusitem.uk.slider', [idx,this.items.eq(idx),this]);
        },

        next: function() {

            var focus = this.items[this.focus + 1] ? (this.focus + 1) : (this.options.infinite ? 0:this.focus);

            this.updateFocus(focus, 1);
        },

        previous: function() {

            var focus = this.items[this.focus - 1] ? (this.focus - 1) : (this.options.infinite ? (this.items[this.focus - 1] ? this.items-1:this.items.length-1):this.focus);

            this.updateFocus(focus, -1);
        },

        start: function() {

            this.stop();

            var $this = this;

            this.interval = setInterval(function() {
                if (!$this.hovering) $this.next();
            }, this.options.autoplayInterval);

        },

        stop: function() {
            if (this.interval) clearInterval(this.interval);
        },

        infinite: function(baseidx, direction) {

            var $this = this, item = this.items.eq(baseidx), i, z = baseidx, move = [], area = 0;

            if (direction == 1) {


                for (i=0;i<this.items.length;i++) {

                    if (z != baseidx) {
                        area += this.items.eq(z).data('width');
                        move.push(this.items.eq(z));
                    }

                    if (area > this.vp) {
                        break;
                    }

                    z = z+1 == this.items.length ? 0:z+1;
                }

                if (move.length) {

                    move.forEach(function(itm){

                        var left = item.data('area');

                        itm.css({'left': left}).data({
                            'left'  : left,
                            'area'  : (left+itm.data('width')),
                            'center': (left - ($this.vp/2 - itm.data('cwidth')/2))
                        });

                        item = itm;
                    });
                }


            } else {

                for (i=this.items.length-1;i >-1 ;i--) {

                    area += this.items.eq(z).data('width');

                    if (z != baseidx) {
                        move.push(this.items.eq(z));
                    }

                    if (area > this.vp) {
                        break;
                    }

                    z = z-1 == -1 ? this.items.length-1:z-1;
                }

                if (move.length) {

                    move.forEach(function(itm){

                        var left = item.data('left') - itm.data('width');

                        itm.css({'left': left}).data({
                            'left'  : left,
                            'area'  : (left+itm.data('width')),
                            'center': (left - ($this.vp/2 - itm.data('cwidth')/2))
                        });

                        item = itm;
                    });
                }
            }
        }
    });

    // handle dragging
    UI.$doc.on('mousemove.uk.slider touchmove.uk.slider', function(e) {

        if (e.originalEvent && e.originalEvent.touches) {
            e = e.originalEvent.touches[0];
        }

        if (delayIdle && Math.abs(e.pageX - delayIdle.x) > delayIdle.threshold) {

            if (!window.getSelection().toString()) {
                delayIdle(e);
            } else {
                dragging = delayIdle = false;
            }
        }

        if (!dragging) {
            return;
        }

        var x, xDiff, pos, dir, focus, item, next, diff, i, z, itm;

        if (e.clientX || e.clientY) {
            x = e.clientX;
        } else if (e.pageX || e.pageY) {
            x = e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft;
        }

        focus = store.focus;
        xDiff = x - dragging.element.data('pointer-start').x;
        pos   = dragging.element.data('pointer-pos-start') + xDiff;
        dir   = x > dragging.element.data('pointer-start').x ? -1:1;
        item  = dragging.items.eq(store.focus);

        if (dir == 1) {

            diff = item.data('left') + Math.abs(xDiff);

            for (i=0,z=store.focus;i<dragging.items.length;i++) {

                itm = dragging.items.eq(z);

                if (z != store.focus && itm.data('left') < diff && itm.data('area') > diff) {
                    focus = z;
                    break;
                }

                z = z+1 == dragging.items.length ? 0:z+1;
            }

        } else {

            diff = item.data('left') - Math.abs(xDiff);

            for (i=0,z=store.focus;i<dragging.items.length;i++) {

                itm = dragging.items.eq(z);

                if (z != store.focus && itm.data('area') <= item.data('left') && itm.data('center') < diff) {
                    focus = z;
                    break;
                }

                z = z-1 == -1 ? dragging.items.length-1:z-1;
            }
        }

        if (dragging.options.infinite && focus!=store._focus) {
            dragging.infinite(focus, dir);
        }

        dragging.updatePos(pos);

        store.dir     = dir;
        store._focus  = focus;
        store.touchx  = parseInt(e.pageX, 10);
        store.diff    = diff;
    });

    UI.$doc.on('mouseup.uk.slider touchend.uk.slider', function(e) {

        if (dragging) {

            dragging.container.removeClass('uk-drag');

            // TODO is this needed?
            dragging.items.eq(store.focus);

            var itm, focus = false, i, z;

            if (store.dir == 1) {

                for (i=0,z=store.focus;i<dragging.items.length;i++) {

                    itm = dragging.items.eq(z);

                    if (z != store.focus && itm.data('left') > store.diff) {
                        focus = z;
                        break;
                    }

                    z = z+1 == dragging.items.length ? 0:z+1;
                }

            } else {

                for (i=0,z=store.focus;i<dragging.items.length;i++) {

                    itm = dragging.items.eq(z);

                    if (z != store.focus && itm.data('left') < store.diff) {
                        focus = z;
                        break;
                    }

                    z = z-1 == -1 ? dragging.items.length-1:z-1;
                }
            }

            dragging.updateFocus(focus!==false ? focus:store._focus);

        }

        dragging = delayIdle = false;
    });

    return UI.slider;
});




// slideset.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-slideset", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";

    var Animations;

    UI.component('slideset', {

        defaults: {
            default          : 1,
            animation        : 'fade',
            duration         : 200,
            filter           : '',
            delay            : false,
            controls         : false,
            autoplay         : false,
            autoplayInterval : 7000,
            pauseOnHover     : true
        },

        sets: [],

        boot: function() {

            // auto init
            UI.ready(function(context) {

                UI.$("[data-uk-slideset]", context).each(function(){

                    var ele = UI.$(this);

                    if(!ele.data("slideset")) {
                        UI.slideset(ele, UI.Utils.options(ele.attr("data-uk-slideset")));
                    }
                });
            });
        },

        init: function() {

            var $this = this;

            this.activeSet = false;
            this.list      = this.element.find('.uk-slideset');
            this.nav       = this.element.find('.uk-slideset-nav');
            this.controls  = this.options.controls ? UI.$(this.options.controls) : this.element;

            UI.$win.on("resize load", UI.Utils.debounce(function() {
                $this.updateSets();
            }, 100));

            $this.list.addClass('uk-grid-width-1-'+$this.options.default);

            ['xlarge', 'large', 'medium', 'small'].forEach(function(bp) {

                if (!$this.options[bp]) {
                    return;
                }

                $this.list.addClass('uk-grid-width-'+bp+'-1-'+$this.options[bp]);
            });

            this.on("click.uk.slideset", '[data-uk-slideset-item]', function(e) {

                e.preventDefault();

                if ($this.animating) {
                    return;
                }

                var set = UI.$(this).attr('data-uk-slideset-item');

                if ($this.activeSet === set) return;

                switch(set) {
                    case 'next':
                    case 'previous':
                        $this[set=='next' ? 'next':'previous']();
                        break;
                    default:
                        $this.show(parseInt(set, 10));
                }

            });

            this.controls.on('click.uk.slideset', '[data-uk-filter]', function(e) {

                var ele = UI.$(this);

                if (ele.parent().hasClass('uk-slideset')) {
                    return;
                }

                e.preventDefault();

                if ($this.animating || $this.currentFilter == ele.attr('data-uk-filter')) {
                    return;
                }

                $this.updateFilter(ele.attr('data-uk-filter'));

                $this._hide().then(function(){

                    $this.updateSets(true, true);
                });
            });

            this.on('swipeRight swipeLeft', function(e) {
                $this[e.type=='swipeLeft' ? 'next' : 'previous']();
            });

            this.updateFilter(this.options.filter);
            this.updateSets();

            this.element.on({
                mouseenter: function() { if ($this.options.pauseOnHover) $this.hovering = true;  },
                mouseleave: function() { $this.hovering = false; }
            });

            // Set autoplay
            if (this.options.autoplay) {
                this.start();
            }
        },

        updateSets: function(animate, force) {

            var visible = this.visible, i;

            this.visible  = this.getVisibleOnCurrenBreakpoint();

            if (visible == this.visible && !force) {
                return;
            }

            this.children = this.list.children().hide();
            this.items    = this.getItems();
            this.sets     = array_chunk(this.items, this.visible);

            for (i=0;i<this.sets.length;i++) {
                this.sets[i].css({'display': 'none'});
            }

            // update nav
            if (this.nav.length && this.nav.empty()) {

                for (i=0;i<this.sets.length;i++) {
                    this.nav.append('<li data-uk-slideset-item="'+i+'"><a></a></li>');
                }

                this.nav[this.nav.children().length==1 ? 'addClass':'removeClass']('uk-invisible');
            }

            this.activeSet = false;
            this.show(0, !animate);
        },

        updateFilter: function(currentfilter) {

            var $this = this, filter;

            this.currentFilter = currentfilter;

            this.controls.find('[data-uk-filter]').each(function(){

                filter = UI.$(this);

                if (!filter.parent().hasClass('uk-slideset')) {

                    if (filter.attr('data-uk-filter') == $this.currentFilter) {
                        filter.addClass('uk-active');
                    } else {
                        filter.removeClass('uk-active');
                    }
                }
            });
        },

        getVisibleOnCurrenBreakpoint: function() {

            var breakpoint  = null,
                tmp         = UI.$('<div style="position:absolute;height:1px;top:-1000px;width:100px"><div></div></div>').appendTo('body'),
                testdiv     = tmp.children().eq(0),
                breakpoints = this.options;

                ['xlarge', 'large', 'medium', 'small'].forEach(function(bp) {

                    if (!breakpoints[bp] || breakpoint) {
                        return;
                    }

                    tmp.attr('class', 'uk-grid-width-'+bp+'-1-2').width();

                    if (testdiv.width() == 50) {
                        breakpoint = bp;
                    }
                });

                tmp.remove();

                return this.options[breakpoint] || this.options['default'];
        },

        getItems: function() {

            var items = [], filter;

            if (this.currentFilter) {

                filter = this.currentFilter || [];

                if (typeof(filter) === 'string') {
                    filter = filter.split(/,/).map(function(item){ return item.trim(); });
                }

                this.children.each(function(index){

                    var ele = UI.$(this), f = ele.attr('data-uk-filter'), infilter = filter.length ? false : true;

                    if (f) {

                        f = f.split(/,/).map(function(item){ return item.trim(); });

                        filter.forEach(function(item){
                            if (f.indexOf(item) > -1) infilter = true;
                        });
                    }

                    if(infilter) items.push(ele[0]);
                });

                items = UI.$(items);

            } else {
                items = this.list.children();
            }

            return items;
        },

        show: function(setIndex, noanimate, dir) {

            var $this = this;

            if (this.activeSet === setIndex || this.animating) {
                return;
            }

            dir = dir || (setIndex < this.activeSet ? -1:1);

            var current   = this.sets[this.activeSet] || [],
                next      = this.sets[setIndex],
                animation = this._getAnimation();

            if (noanimate || !UI.support.animation) {
                animation = Animations.none;
            }

            this.animating = true;

            if (this.nav.length) {
                this.nav.children().removeClass('uk-active').eq(setIndex).addClass('uk-active');
            }

            animation.apply($this, [current, next, dir]).then(function(){

                UI.Utils.checkDisplay(next, true);

                $this.children.hide().removeClass('uk-active');
                next.addClass('uk-active').css({'display': '', 'opacity':''});

                $this.animating = false;
                $this.activeSet = setIndex;

                UI.Utils.checkDisplay(next, true);

                $this.trigger('show.uk.slideset', [next]);
            });

        },

        _getAnimation: function() {

            var animation = Animations[this.options.animation] || Animations.none;

            if (!UI.support.animation) {
                animation = Animations.none;
            }

            return animation;
        },

        _hide: function() {

            var $this     = this,
                current   = this.sets[this.activeSet] || [],
                animation = this._getAnimation();

            this.animating = true;

            return animation.apply($this, [current, [], 1]).then(function(){
                $this.animating = false;
            });
        },

        next: function() {
            this.show(this.sets[this.activeSet + 1] ? (this.activeSet + 1) : 0, false, 1);
        },

        previous: function() {
            this.show(this.sets[this.activeSet - 1] ? (this.activeSet - 1) : (this.sets.length - 1), false, -1);
        },

        start: function() {

            this.stop();

            var $this = this;

            this.interval = setInterval(function() {
                if (!$this.hovering && !$this.animating) $this.next();
            }, this.options.autoplayInterval);

        },

        stop: function() {
            if (this.interval) clearInterval(this.interval);
        }
    });

    Animations = {

        'none': function() {
            var d = UI.$.Deferred();
            d.resolve();
            return d.promise();
        },

        'fade': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-fade', current, next]);
        },

        'slide-bottom': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-bottom', current, next]);
        },

        'slide-top': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-slide-top', current, next]);
        },

        'slide-vertical': function(current, next, dir) {

            var anim = ['uk-animation-slide-top', 'uk-animation-slide-bottom'];

            if (dir == -1) {
                anim.reverse();
            }

            return coreAnimation.apply(this, [anim, current, next]);
        },

        'slide-horizontal': function(current, next, dir) {

            var anim = ['uk-animation-slide-right', 'uk-animation-slide-left'];

            if (dir == -1) {
                anim.reverse();
            }

            return coreAnimation.apply(this, [anim, current, next, dir]);
        },

        'scale': function(current, next) {
            return coreAnimation.apply(this, ['uk-animation-scale-up', current, next]);
        }
    };

    UI.slideset.animations = Animations;

    // helpers

    function coreAnimation(cls, current, next, dir) {

        var d     = UI.$.Deferred(),
            delay = (this.options.delay === false) ? Math.floor(this.options.duration/2) : this.options.delay,
            $this = this, clsIn, clsOut, release, i;

        dir = dir || 1;

        this.element.css('min-height', this.element.height());

        if (next[0]===current[0]) {
            d.resolve();
            return d.promise();
        }

        if (typeof(cls) == 'object') {
            clsIn  = cls[0];
            clsOut = cls[1] || cls[0];
        } else {
            clsIn  = cls;
            clsOut = clsIn;
        }

        release = function() {

            if (current && current.length) {
                current.hide().removeClass(clsOut+' uk-animation-reverse').css({'opacity':'', 'animation-delay': '', 'animation':''});
            }

            if (!next.length) {
                d.resolve();
                return;
            }

            for (i=0;i<next.length;i++) {
                next.eq(dir == 1 ? i:(next.length - i)-1).css('animation-delay', (i*delay)+'ms');
            }

            var finish = function() {
                next.removeClass(''+clsIn+'').css({opacity:'', display:'', 'animation-delay':'', 'animation':''});
                d.resolve();
                $this.element.css('min-height', '');
                finish = false;
            };

            next.addClass(clsIn)[dir==1 ? 'last':'first']().one(UI.support.animation.end, function(){
                if(finish) finish();
            }).end().css('display', '');

            // make sure everything resolves really
            setTimeout(function() {
                if(finish) finish();
            },  next.length * delay * 2);
        };

        if (next.length) {
            next.css('animation-duration', this.options.duration+'ms');
        }

        if (current && current.length) {

            current.css('animation-duration', this.options.duration+'ms')[dir==1 ? 'last':'first']().one(UI.support.animation.end, function() {
                release();
            });

            for (i=0;i<current.length;i++) {

                (function (index, ele){

                    setTimeout(function(){

                        ele.css('display', 'none').css('display', '').css('opacity', 0).on(UI.support.animation.end, function(){
                            ele.removeClass(clsOut);
                        }).addClass(clsOut+' uk-animation-reverse');

                    }.bind(this), i * delay);

                })(i, current.eq(dir == 1 ? i:(current.length - i)-1));
            }

        } else {
            release();
        }

        return d.promise();
    }

    function array_chunk(input, size) {

        var x, i = 0, c = -1, l = input.length || 0, n = [];

        if (size < 1) return null;

        while (i < l) {

            x = i % size;

            if(x) {
                n[c][x] = input[i];
            } else {
                n[++c] = [input[i]];
            }

            i++;
        }

        i = 0;
        l = n.length;

        while (i < l) {
            n[i] = jQuery(n[i]);
            i++;
        }

        return n;
    }

});





// slideshow.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-slideshow", ["uikit"], function() {
            return component || addon(UIkit);
        });
    }

})(function(UI) {

    "use strict";

    var Animations, playerId = 0;

    UI.component('slideshow', {

        defaults: {
            animation          : "fade",
            duration           : 500,
            height             : "auto",
            start              : 0,
            autoplay           : false,
            autoplayInterval   : 7000,
            videoautoplay      : true,
            videomute          : true,
            slices             : 15,
            pauseOnHover       : true,
            kenburns           : false,
            kenburnsanimations : [
                'uk-animation-middle-left',
                'uk-animation-top-right',
                'uk-animation-bottom-left',
                'uk-animation-top-center',
                '', // middle-center
                'uk-animation-bottom-right'
            ]
        },

        current  : false,
        interval : null,
        hovering : false,

        boot: function() {

            // init code
            UI.ready(function(context) {

                UI.$('[data-uk-slideshow]', context).each(function() {

                    var slideshow = UI.$(this);

                    if (!slideshow.data("slideshow")) {
                        UI.slideshow(slideshow, UI.Utils.options(slideshow.attr("data-uk-slideshow")));
                    }
                });
            });
        },

        init: function() {

            var $this = this, canvas, kbanimduration;

            this.container     = this.element.hasClass('uk-slideshow') ? this.element : UI.$(this.find('.uk-slideshow'));
            this.slides        = this.container.children();
            this.slidesCount   = this.slides.length;
            this.current       = this.options.start;
            this.animating     = false;
            this.triggers      = this.find('[data-uk-slideshow-item]');
            this.fixFullscreen = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && this.container.hasClass('uk-slideshow-fullscreen'); // viewport unit fix for height:100vh - should be fixed in iOS 8

            if (this.options.kenburns) {

                kbanimduration = this.options.kenburns === true ? '15s': this.options.kenburns;

                if (!String(kbanimduration).match(/(ms|s)$/)) {
                    kbanimduration += 'ms';
                }

                if (typeof(this.options.kenburnsanimations) == 'string') {
                    this.options.kenburnsanimations = this.options.kenburnsanimations.split(',');
                }
            }

            this.slides.each(function(index) {

                var slide = UI.$(this),
                    media = slide.children('img,video,iframe').eq(0);

                slide.data('media', media);
                slide.data('sizer', media);

                if (media.length) {

                    var placeholder;

                    switch(media[0].nodeName) {
                        case 'IMG':

                            var cover = UI.$('<div class="uk-cover-background uk-position-cover"></div>').css({'background-image':'url('+ media.attr('src') + ')'});

                            if (media.attr('width') && media.attr('height')) {
                                placeholder = UI.$('<canvas></canvas>').attr({width:media.attr('width'), height:media.attr('height')});
                                media.replaceWith(placeholder);
                                media = placeholder;
                                placeholder = undefined;
                            }

                            media.css({width: '100%',height: 'auto', opacity:0});
                            slide.prepend(cover).data('cover', cover);
                            break;

                        case 'IFRAME':

                            var src = media[0].src, iframeId = 'sw-'+(++playerId);

                            media
                                .attr('src', '').on('load', function(){

                                    if (index !== $this.current || (index == $this.current && !$this.options.videoautoplay)) {
                                        $this.pausemedia(media);
                                    }

                                    if ($this.options.videomute) {

                                        $this.mutemedia(media);

                                        var inv = setInterval((function(ic) {
                                            return function() {
                                                $this.mutemedia(media);
                                                if (++ic >= 4) clearInterval(inv);
                                            }
                                        })(0), 250);
                                    }

                                })
                                .data('slideshow', $this)  // add self-reference for the vimeo-ready listener
                                .attr('data-player-id', iframeId)  // add frameId for the vimeo-ready listener
                                .attr('src', [src, (src.indexOf('?') > -1 ? '&':'?'), 'enablejsapi=1&api=1&player_id='+iframeId].join(''))
                                .addClass('uk-position-absolute');

                            // disable pointer events
                            if(!UI.support.touch) media.css('pointer-events', 'none');

                            placeholder = true;

                            if (UI.cover) {
                                UI.cover(media);
                                media.attr('data-uk-cover', '{}');
                            }

                            break;

                        case 'VIDEO':
                            media.addClass('uk-cover-object uk-position-absolute');
                            placeholder = true;

                            if ($this.options.videomute) $this.mutemedia(media);
                    }

                    if (placeholder) {

                        canvas  = UI.$('<canvas></canvas>').attr({'width': media[0].width, 'height': media[0].height});
                        var img = UI.$('<img style="width:100%;height:auto;">').attr('src', canvas[0].toDataURL());

                        slide.prepend(img);
                        slide.data('sizer', img);
                    }

                } else {
                    slide.data('sizer', slide);
                }

                if ($this.hasKenBurns(slide)) {

                    slide.data('cover').css({
                        '-webkit-animation-duration': kbanimduration,
                        'animation-duration': kbanimduration
                    });
                }
            });

            this.on("click.uk.slideshow", '[data-uk-slideshow-item]', function(e) {

                e.preventDefault();

                var slide = UI.$(this).attr('data-uk-slideshow-item');

                if ($this.current == slide) return;

                switch(slide) {
                    case 'next':
                    case 'previous':
                        $this[slide=='next' ? 'next':'previous']();
                        break;
                    default:
                        $this.show(parseInt(slide, 10));
                }

                $this.stop();
            });

            // Set start slide
            this.slides.attr('aria-hidden', 'true').eq(this.current).addClass('uk-active').attr('aria-hidden', 'false');
            this.triggers.filter('[data-uk-slideshow-item="'+this.current+'"]').addClass('uk-active');

            UI.$win.on("resize load", UI.Utils.debounce(function() {
                $this.resize();

                if ($this.fixFullscreen) {
                    $this.container.css('height', window.innerHeight);
                    $this.slides.css('height', window.innerHeight);
                }
            }, 100));

            // chrome image load fix
            setTimeout(function(){
                $this.resize();
            }, 80);

            // Set autoplay
            if (this.options.autoplay) {
                this.start();
            }

            if (this.options.videoautoplay && this.slides.eq(this.current).data('media')) {
                this.playmedia(this.slides.eq(this.current).data('media'));
            }

            if (this.options.kenburns) {
                this.applyKenBurns(this.slides.eq(this.current));
            }

            this.container.on({
                mouseenter: function() { if ($this.options.pauseOnHover) $this.hovering = true;  },
                mouseleave: function() { $this.hovering = false; }
            });

            this.on('swipeRight swipeLeft', function(e) {
                $this[e.type=='swipeLeft' ? 'next' : 'previous']();
            });

            this.on('display.uk.check', function(){
                if ($this.element.is(":visible")) {

                    $this.resize();

                    if ($this.fixFullscreen) {
                        $this.container.css('height', window.innerHeight);
                        $this.slides.css('height', window.innerHeight);
                    }
                }
            });
        },


        resize: function() {

            if (this.container.hasClass('uk-slideshow-fullscreen')) return;

            var height = this.options.height;

            if (this.options.height === 'auto') {

                height = 0;

                this.slides.css('height', '').each(function() {
                    height = Math.max(height, UI.$(this).height());
                });
            }

            this.container.css('height', height);
            this.slides.css('height', height);
        },

        show: function(index, direction) {

            if (this.animating || this.current == index) return;

            this.animating = true;

            var $this        = this,
                current      = this.slides.eq(this.current),
                next         = this.slides.eq(index),
                dir          = direction ? direction : this.current < index ? 1 : -1,
                currentmedia = current.data('media'),
                animation    = Animations[this.options.animation] ? this.options.animation : 'fade',
                nextmedia    = next.data('media'),
                finalize     = function() {

                    if (!$this.animating) return;

                    if (currentmedia && currentmedia.is('video,iframe')) {
                        $this.pausemedia(currentmedia);
                    }

                    if (nextmedia && nextmedia.is('video,iframe')) {
                        $this.playmedia(nextmedia);
                    }

                    next.addClass("uk-active").attr('aria-hidden', 'false');
                    current.removeClass("uk-active").attr('aria-hidden', 'true');

                    $this.animating = false;
                    $this.current   = index;

                    UI.Utils.checkDisplay(next, '[class*="uk-animation-"]:not(.uk-cover-background.uk-position-cover)');

                    $this.trigger('show.uk.slideshow', [next, current, $this]);
                };

            $this.applyKenBurns(next);

            // animation fallback
            if (!UI.support.animation) {
                animation = 'none';
            }

            current = UI.$(current);
            next    = UI.$(next);

            $this.trigger('beforeshow.uk.slideshow', [next, current, $this]);

            Animations[animation].apply(this, [current, next, dir]).then(finalize);

            $this.triggers.removeClass('uk-active');
            $this.triggers.filter('[data-uk-slideshow-item="'+index+'"]').addClass('uk-active');
        },

        applyKenBurns: function(slide) {

            if (!this.hasKenBurns(slide)) {
                return;
            }

            var animations = this.options.kenburnsanimations,
                index      = this.kbindex || 0;


            slide.data('cover').attr('class', 'uk-cover-background uk-position-cover').width();
            slide.data('cover').addClass(['uk-animation-scale', 'uk-animation-reverse', animations[index].trim()].join(' '));

            this.kbindex = animations[index + 1] ? (index+1):0;
        },

        hasKenBurns: function(slide) {
            return (this.options.kenburns && slide.data('cover'));
        },

        next: function() {
            this.show(this.slides[this.current + 1] ? (this.current + 1) : 0, 1);
        },

        previous: function() {
            this.show(this.slides[this.current - 1] ? (this.current - 1) : (this.slides.length - 1), -1);
        },

        start: function() {

            this.stop();

            var $this = this;

            this.interval = setInterval(function() {
                if (!$this.hovering) $this.next();
            }, this.options.autoplayInterval);

        },

        stop: function() {
            if (this.interval) clearInterval(this.interval);
        },

        playmedia: function(media) {

            if (!(media && media[0])) return;

            switch(media[0].nodeName) {
                case 'VIDEO':

                    if (!this.options.videomute) {
                        media[0].muted = false;
                    }

                    media[0].play();
                    break;
                case 'IFRAME':

                    if (!this.options.videomute) {
                        media[0].contentWindow.postMessage('{ "event": "command", "func": "unmute", "method":"setVolume", "value":1}', '*');
                    }

                    media[0].contentWindow.postMessage('{ "event": "command", "func": "playVideo", "method":"play"}', '*');
                    break;
            }
        },

        pausemedia: function(media) {

            switch(media[0].nodeName) {
                case 'VIDEO':
                    media[0].pause();
                    break;
                case 'IFRAME':
                    media[0].contentWindow.postMessage('{ "event": "command", "func": "pauseVideo", "method":"pause"}', '*');
                    break;
            }
        },

        mutemedia: function(media) {

            switch(media[0].nodeName) {
                case 'VIDEO':
                    media[0].muted = true;
                    break;
                case 'IFRAME':
                    media[0].contentWindow.postMessage('{ "event": "command", "func": "mute", "method":"setVolume", "value":0}', '*');
                    break;
            }
        }
    });

    Animations = {

        'none': function() {

            var d = UI.$.Deferred();
            d.resolve();
            return d.promise();
        },

        'scroll': function(current, next, dir) {

            var d = UI.$.Deferred();

            current.css('animation-duration', this.options.duration+'ms');
            next.css('animation-duration', this.options.duration+'ms');

            next.css('opacity', 1).one(UI.support.animation.end, function() {

                current.removeClass(dir == -1 ? 'uk-slideshow-scroll-backward-out' : 'uk-slideshow-scroll-forward-out');
                next.css('opacity', '').removeClass(dir == -1 ? 'uk-slideshow-scroll-backward-in' : 'uk-slideshow-scroll-forward-in');
                d.resolve();

            }.bind(this));

            current.addClass(dir == -1 ? 'uk-slideshow-scroll-backward-out' : 'uk-slideshow-scroll-forward-out');
            next.addClass(dir == -1 ? 'uk-slideshow-scroll-backward-in' : 'uk-slideshow-scroll-forward-in');
            next.width(); // force redraw

            return d.promise();
        },

        'swipe': function(current, next, dir) {

            var d = UI.$.Deferred();

            current.css('animation-duration', this.options.duration+'ms');
            next.css('animation-duration', this.options.duration+'ms');

            next.css('opacity', 1).one(UI.support.animation.end, function() {

                current.removeClass(dir === -1 ? 'uk-slideshow-swipe-backward-out' : 'uk-slideshow-swipe-forward-out');
                next.css('opacity', '').removeClass(dir === -1 ? 'uk-slideshow-swipe-backward-in' : 'uk-slideshow-swipe-forward-in');
                d.resolve();

            }.bind(this));

            current.addClass(dir == -1 ? 'uk-slideshow-swipe-backward-out' : 'uk-slideshow-swipe-forward-out');
            next.addClass(dir == -1 ? 'uk-slideshow-swipe-backward-in' : 'uk-slideshow-swipe-forward-in');
            next.width(); // force redraw

            return d.promise();
        },

        'scale': function(current, next, dir) {

            var d = UI.$.Deferred();

            current.css('animation-duration', this.options.duration+'ms');
            next.css('animation-duration', this.options.duration+'ms');

            next.css('opacity', 1);

            current.one(UI.support.animation.end, function() {

                current.removeClass('uk-slideshow-scale-out');
                next.css('opacity', '');
                d.resolve();

            }.bind(this));

            current.addClass('uk-slideshow-scale-out');
            current.width(); // force redraw

            return d.promise();
        },

        'fade': function(current, next, dir) {

            var d = UI.$.Deferred();

            current.css('animation-duration', this.options.duration+'ms');
            next.css('animation-duration', this.options.duration+'ms');

            next.css('opacity', 1);

            // for plain text content slides - looks smoother
            if (!(next.data('cover') || next.data('placeholder'))) {

                next.css('opacity', 1).one(UI.support.animation.end, function() {
                    next.removeClass('uk-slideshow-fade-in');
                }).addClass('uk-slideshow-fade-in');
            }

            current.one(UI.support.animation.end, function() {

                current.removeClass('uk-slideshow-fade-out');
                next.css('opacity', '');
                d.resolve();

            }.bind(this));

            current.addClass('uk-slideshow-fade-out');
            current.width(); // force redraw

            return d.promise();
        }
    };

    UI.slideshow.animations = Animations;

    // Listen for messages from the vimeo player
    window.addEventListener('message', function onMessageReceived(e) {

        var data = e.data, iframe;

        if (typeof(data) == 'string') {

            try {
                data = JSON.parse(data);
            } catch(err) {
                data = {};
            }
        }

        if (e.origin && e.origin.indexOf('vimeo') > -1 && data.event == 'ready' && data.player_id) {
            iframe = UI.$('[data-player-id="'+ data.player_id+'"]');

            if (iframe.length) {
                iframe.data('slideshow').mutemedia(iframe);
            }
        }
    }, false);

});





// slideshow-fx.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-slideshow-fx", ["uikit"], function() {
            return component || addon(UIkit);
        });
    }

})(function(UI) {

    "use strict";

    var Animations = UI.slideshow.animations;

    UI.$.extend(UI.slideshow.animations, {
        'slice': function(current, next, dir, fromfx) {

            if (!current.data('cover')) {
                return Animations.fade.apply(this, arguments);
            }

            var d = UI.$.Deferred();

            var sliceWidth = Math.ceil(this.element.width() / this.options.slices),
                bgimage    = next.data('cover').css('background-image'),
                ghost      = UI.$('<li></li>').css({
                    top    : 0,
                    left   : 0,
                    width  : this.container.width(),
                    height : this.container.height(),
                    opacity: 1,
                    zIndex : 15
                }),
                ghostWidth  = ghost.width(),
                ghostHeight = ghost.height(),
                pos         = fromfx == 'slice-up' ? ghostHeight:'0',
                bar;

            for (var i = 0; i < this.options.slices; i++) {

                if (fromfx == 'slice-up-down') {
                    pos = ((i % 2) + 2) % 2==0 ? '0':ghostHeight;
                }

                var width    = (i == this.options.slices-1) ? sliceWidth : sliceWidth,
                    clipto   = ('rect(0px, '+(width*(i+1))+'px, '+ghostHeight+'px, '+(sliceWidth*i)+'px)'),
                    clipfrom;

                //slice-down - default
                clipfrom = ('rect(0px, '+(width*(i+1))+'px, 0px, '+(sliceWidth*i)+'px)');

                if (fromfx == 'slice-up' || (fromfx == 'slice-up-down' && ((i % 2) + 2) % 2==0 )) {
                    clipfrom = ('rect('+ghostHeight+'px, '+(width*(i+1))+'px, '+ghostHeight+'px, '+(sliceWidth*i)+'px)');
                }

                bar = UI.$('<div class="uk-cover-background"></div>').css({
                    'position'           : 'absolute',
                    'top'                : 0,
                    'left'               : 0,
                    'width'              : ghostWidth,
                    'height'             : ghostHeight,
                    'background-image'   : bgimage,
                    'clip'               : clipfrom,
                    'opacity'            : 0,
                    'transition'         : 'all '+this.options.duration+'ms ease-in-out '+(i*60)+'ms',
                    '-webkit-transition' : 'all '+this.options.duration+'ms ease-in-out '+(i*60)+'ms'

                }).data('clip', clipto);

                ghost.append(bar);
            }

            this.container.append(ghost);

            ghost.children().last().on(UI.support.transition.end, function() {
                ghost.remove();
                d.resolve();
            });

            ghost.width();

            ghost.children().each(function() {
                var bar = UI.$(this);

                bar.css({
                    'clip': bar.data('clip'),
                    'opacity': 1
                });
            });

            return d.promise();
        },

        'slice-up': function(current, next, dir) {
            return Animations.slice.apply(this, [current, next, dir, 'slice-up']);
        },

        'slice-down': function(current, next, dir) {
            return Animations.slice.apply(this, [current, next, dir, 'slice-down']);
        },

        'slice-up-down': function(current, next, dir) {
            return Animations.slice.apply(this, [current, next, dir, 'slice-up-down']);
        },

        'fold': function(current, next, dir) {

            if (!next.data('cover')) {
                return Animations.fade.apply(this, arguments);
            }

            var d = UI.$.Deferred();

            var sliceWidth = Math.ceil(this.element.width() / this.options.slices),
                bgimage    = next.data('cover').css('background-image'),
                ghost      = UI.$('<li></li>').css({
                    width  : next.width(),
                    height : next.height(),
                    opacity: 1,
                    zIndex : 15
                }),
                ghostWidth  = next.width(),
                ghostHeight = next.height(),
                bar;

            for (var i = 0; i < this.options.slices; i++) {

                bar = UI.$('<div class="uk-cover-background"></div>').css({
                    'position'           : 'absolute',
                    'top'                : 0,
                    'left'               : 0,
                    'width'              : ghostWidth,
                    'height'             : ghostHeight,
                    'background-image'   : bgimage,
                    'transform-origin'   : (sliceWidth*i)+'px 0 0',
                    'clip'               : ('rect(0px, '+(sliceWidth*(i+1))+'px, '+ghostHeight+'px, '+(sliceWidth*i)+'px)'),
                    'opacity'            : 0,
                    'transform'          : 'scaleX(0.000001)',
                    'transition'         : 'all '+this.options.duration+'ms ease-in-out '+(100+i*60)+'ms',
                    '-webkit-transition' : 'all '+this.options.duration+'ms ease-in-out '+(100+i*60)+'ms'
                });

                ghost.prepend(bar);
            }

            this.container.append(ghost);

            ghost.width();

            ghost.children().first().on(UI.support.transition.end, function() {
                ghost.remove();
                d.resolve();
            }).end().css({
                'transform': 'scaleX(1)',
                'opacity': 1
            });

            return d.promise();
        },

        'puzzle': function(current, next, dir) {

            if (!next.data('cover')) {
                return Animations.fade.apply(this, arguments);
            }

            var d = UI.$.Deferred(), $this = this;

            var boxCols   = Math.round(this.options.slices/2),
                boxWidth  = Math.round(next.width()/boxCols),
                boxRows   = Math.round(next.height()/boxWidth),
                boxHeight = Math.round(next.height()/boxRows)+1,
                bgimage   = next.data('cover').css('background-image'),
                ghost     = UI.$('<li></li>').css({
                    width   : this.container.width(),
                    height  : this.container.height(),
                    opacity : 1,
                    zIndex  : 15
                }),
                ghostWidth  = this.container.width(),
                ghostHeight = this.container.height(),
                box, rect, width;

            for (var rows = 0; rows < boxRows; rows++) {

                for (var cols = 0; cols < boxCols; cols++) {

                    width  = (cols == boxCols-1) ? (boxWidth + 2) : boxWidth;

                    rect = [
                        (boxHeight * rows)       +'px', // top
                        (width  * (cols+1))      +'px', // right
                        (boxHeight * (rows + 1)) +'px', // bottom
                        (boxWidth  * cols)       +'px'  // left
                    ];

                    box = UI.$('<div class="uk-cover-background"></div>').css({
                        'position'          : 'absolute',
                        'top'               : 0,
                        'left'              : 0,
                        'opacity'           : 0,
                        'width'             : ghostWidth,
                        'height'            : ghostHeight,
                        'background-image'  : bgimage,
                        'clip'              : ('rect('+rect.join(',')+')'),
                        '-webkit-transform' : 'translateZ(0)', // fixes webkit opacity flickering bug
                        'transform'         : 'translateZ(0)'          // fixes moz opacity flickering bug
                    });

                    ghost.append(box);
                }
            }

            this.container.append(ghost);

            var boxes = shuffle(ghost.children());

            boxes.each(function(i) {
                UI.$(this).css({
                    'transition': 'all '+$this.options.duration+'ms ease-in-out '+(50+i*25)+'ms',
                    '-webkit-transition': 'all '+$this.options.duration+'ms ease-in-out '+(50+i*25)+'ms'
                });
            }).last().on(UI.support.transition.end, function() {
                ghost.remove();
                d.resolve();
            });

            ghost.width();

            boxes.css({'opacity': 1});

            return d.promise();
        },

        'boxes': function(current, next, dir, fromfx) {

            if (!next.data('cover')) {
                return Animations.fade.apply(this, arguments);
            }

            var d = UI.$.Deferred();

            var boxCols   = Math.round(this.options.slices/2),
                boxWidth  = Math.round(next.width()/boxCols),
                boxRows   = Math.round(next.height()/boxWidth),
                boxHeight = Math.round(next.height()/boxRows)+1,
                bgimage   = next.data('cover').css('background-image'),
                ghost     = UI.$('<li></li>').css({
                    width   : next.width(),
                    height  : next.height(),
                    opacity : 1,
                    zIndex  : 15
                }),
                ghostWidth  = next.width(),
                ghostHeight = next.height(),
                box, rect, width, cols;

            for (var rows = 0; rows < boxRows; rows++) {

                for (cols = 0; cols < boxCols; cols++) {

                    width  = (cols == boxCols-1) ? (boxWidth + 2) : boxWidth;

                    rect = [
                        (boxHeight * rows)       +'px', // top
                        (width  * (cols+1))      +'px', // right
                        (boxHeight * (rows + 1)) +'px', // bottom
                        (boxWidth  * cols)       +'px'  // left
                    ];

                    box = UI.$('<div class="uk-cover-background"></div>').css({
                        'position'          : 'absolute',
                        'top'               : 0,
                        'left'              : 0,
                        'opacity'           : 1,
                        'width'             : ghostWidth,
                        'height'            : ghostHeight,
                        'background-image'  : bgimage,
                        'transform-origin'  : rect[3]+' '+rect[0]+' 0',
                        'clip'              : ('rect('+rect.join(',')+')'),
                        '-webkit-transform' : 'scale(0.0000000000000001)',
                        'transform'         : 'scale(0.0000000000000001)'
                    });

                    ghost.append(box);
                }
            }

            this.container.append(ghost);

            var rowIndex = 0, colIndex = 0, timeBuff = 0, box2Darr = [[]], boxes = ghost.children(), prevCol;

            if (fromfx == 'boxes-reverse') {
                boxes = [].reverse.apply(boxes);
            }

            boxes.each(function() {

                box2Darr[rowIndex][colIndex] = UI.$(this);
                colIndex++;

                if(colIndex == boxCols) {
                    rowIndex++;
                    colIndex = 0;
                    box2Darr[rowIndex] = [];
                }
            });

            for (cols = 0, prevCol = 0; cols < (boxCols * boxRows); cols++) {

                prevCol = cols;

                for (var row = 0; row < boxRows; row++) {

                    if (prevCol >= 0 && prevCol < boxCols) {

                        box2Darr[row][prevCol].css({
                            'transition': 'all '+this.options.duration+'ms linear '+(50+timeBuff)+'ms',
                            '-webkit-transition': 'all '+this.options.duration+'ms linear '+(50+timeBuff)+'ms'
                        });
                    }
                    prevCol--;
                }
                timeBuff += 100;
            }

            boxes.last().on(UI.support.transition.end, function() {
                ghost.remove();
                d.resolve();
            });

            ghost.width();

            boxes.css({
                '-webkit-transform': 'scale(1)',
                'transform': 'scale(1)'
            });

            return d.promise();
        },

        'boxes-reverse': function(current, next, dir) {
            return Animations.boxes.apply(this, [current, next, dir, 'boxes-reverse']);
        },

        'random-fx': function(){

            var animations = ['slice-up', 'fold', 'puzzle', 'slice-down', 'boxes', 'slice-up-down', 'boxes-reverse'];

            this.fxIndex = (this.fxIndex === undefined ? -1 : this.fxIndex) + 1;

            if (!animations[this.fxIndex]) this.fxIndex = 0;

            return Animations[animations[this.fxIndex]].apply(this, arguments);
        }
    });


    // helper functions

    // Shuffle an array
    var shuffle = function(arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x) {}
        return arr;
    };

    return UI.slideshow.animations;
});





// timepicker.js
/*! UIkit 2.26.3 | http://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
(function(addon) {

    var component;

    if (window.UIkit) {
        component = addon(UIkit);
    }

    if (typeof define == "function" && define.amd) {
        define("uikit-timepicker", ["uikit"], function(){
            return component || addon(UIkit);
        });
    }

})(function(UI){

    "use strict";


    UI.component('timepicker', {

        defaults: {
            format : '24h',
            delay  : 0,
            start  : 0,
            end    : 24
        },

        boot: function() {

            // init code
            UI.$html.on("focus.timepicker.uikit", "[data-uk-timepicker]", function(e) {

                var ele = UI.$(this);

                if (!ele.data("timepicker")) {
                    var obj = UI.timepicker(ele, UI.Utils.options(ele.attr("data-uk-timepicker")));

                    setTimeout(function(){
                        obj.autocomplete.input.focus();
                    }, 40);
                }
            });
        },

        init: function() {

            var $this  = this, times = getTimeRange(this.options.start, this.options.end), container;

            this.options.minLength = 0;
            this.options.template  = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>';

            this.options.source = function(release) {
                release(times[$this.options.format] || times['12h']);
            };

            if (this.element.is('input')) {
                this.element.wrap('<div class="uk-autocomplete"></div>');
                container = this.element.parent();
            } else {
                container = this.element.addClass('uk-autocomplete');
            }

            this.autocomplete = UI.autocomplete(container, this.options);
            this.autocomplete.dropdown.addClass('uk-dropdown-small uk-dropdown-scrollable');

            this.autocomplete.on('show.uk.autocomplete', function() {

                var selected = $this.autocomplete.dropdown.find('[data-value="'+$this.autocomplete.input.val()+'"]');

                setTimeout(function(){
                    $this.autocomplete.pick(selected, true);
                }, 10);
            });

            this.autocomplete.input.on('focus', function(){

                $this.autocomplete.value = Math.random();
                $this.autocomplete.triggercomplete();

            }).on('blur', UI.Utils.debounce(function() {
                $this.checkTime();
            }, 100));

            this.element.data("timepicker", this);
        },

        checkTime: function() {

            var arr, timeArray, meridian = 'AM', hour, minute, time = this.autocomplete.input.val();

            if (this.options.format == '12h') {
                arr = time.split(' ');
                timeArray = arr[0].split(':');
                meridian = arr[1];
            } else {
                timeArray = time.split(':');
            }

            hour   = parseInt(timeArray[0], 10);
            minute = parseInt(timeArray[1], 10);

            if (isNaN(hour))   hour = 0;
            if (isNaN(minute)) minute = 0;

            if (this.options.format == '12h') {
                if (hour > 12) {
                    hour = 12;
                } else if (hour < 0) {
                    hour = 12;
                }

                if (meridian === 'am' || meridian === 'a') {
                    meridian = 'AM';
                } else if (meridian === 'pm' || meridian === 'p') {
                    meridian = 'PM';
                }

                if (meridian !== 'AM' && meridian !== 'PM') {
                    meridian = 'AM';
                }

            } else {

                if (hour >= 24) {
                    hour = 23;
                } else if (hour < 0) {
                    hour = 0;
                }
            }

            if (minute < 0) {
                minute = 0;
            } else if (minute >= 60) {
                minute = 0;
            }

            this.autocomplete.input.val(this.formatTime(hour, minute, meridian)).trigger('change');
        },

        formatTime: function(hour, minute, meridian) {
            hour = hour < 10 ? '0' + hour : hour;
            minute = minute < 10 ? '0' + minute : minute;
            return hour + ':' + minute + (this.options.format == '12h' ? ' ' + meridian : '');
        }
    });

    // helper

    function getTimeRange(start, end) {

        start = start || 0;
        end   = end || 24;

        var times = {'12h':[], '24h':[]}, i, h;

        for (i = start, h=''; i<end; i++) {

            h = ''+i;

            if (i<10)  h = '0'+h;

            times['24h'].push({value: (h+':00')});
            times['24h'].push({value: (h+':30')});

            if (i === 0) {
                h = 12;
                times['12h'].push({value: (h+':00 AM')});
                times['12h'].push({value: (h+':30 AM')});
            }

            if (i > 0 && i<13 && i!==12) {
                times['12h'].push({value: (h+':00 AM')});
                times['12h'].push({value: (h+':30 AM')});
            }

            if (i >= 12) {

                h = h-12;
                if (h === 0) h = 12;
                if (h < 10) h = '0'+String(h);

                times['12h'].push({value: (h+':00 PM')});
                times['12h'].push({value: (h+':30 PM')});
            }
        }

        return times;
    }

});
