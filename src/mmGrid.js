/**
 * User: meimeibw
 */

!function($){
    var MMGrid = function (element, options) {
        this.opts = options;

        this._initLayout($(element));
        this._intiHead();
        this._initOptions();
        this._initEvents();
    };

    MMGrid.prototype = {

        _initLayout: function($el){
            var $elParent = $el.parent();
            var elIndex = $el.index();

            var mmGrid = [
                '<div class="mmGrid">',
                    '<style></style>',
                    '<div class="mmg-headWrapper">',
                        '<table class="mmg-head"></table>',
                        '<div class="mmg-colResizePointer"></div>',
                    '</div>',
                    '<div class="mmg-backboard">',
                        '<a class="mmg-btnBackboardUp"></a>',
                    '</div>',
                    '<div class="mmg-bodyWrapper">',
                        '<a class="mmg-btnBackboardDn"></a>',
                        '<div class="mmg-noData">'+ this.opts.noDataText +'</div>',
                    '</div>',
                    '<div class="mmg-mask mmg-transparent"></div>',
                    '<div class="mmg-loading">',
                        '<div class="mmg-loadingImg"></div>',
                        '<div class="mmg-loadingText">'+ this.opts.loadingText +'</div>',
                    '</div>',

                '</div>'
            ];

            //cached object
            var $mmGrid = $(mmGrid.join(''));
            this.$mmGrid = $mmGrid;
            this.$style = $mmGrid.find('style');
            this.$headWrapper = $mmGrid.find('.mmg-headWrapper');
            this.$head = $mmGrid.find('.mmg-head');
            this.$backboard = $mmGrid.find('.mmg-backboard');
            this.$bodyWrapper = $mmGrid.find('.mmg-bodyWrapper');
            this.$body = $el.addClass('mmg-body').empty()
                .html('<tbody><td style="border: 0px;background: none;">&nbsp;</td></tbody>')
                .appendTo(this.$bodyWrapper);

            //放回原位置
            if(elIndex === 0 || $elParent.children().length == 0){
                $elParent.prepend(this.$mmGrid);
            }else{
                $elParent.children().eq(elIndex-1).after(this.$mmGrid);
            }

            var opts = this.opts;
            $mmGrid.width(opts.width);
            if(!opts.fitRows){
                $mmGrid.height(opts.height);
            }
        }

        , _intiHead: function(){


        }

        , _initOptions: function(){

        }

        , _initEvents: function(){

        }
    };

    $.fn.mmGrid = function(){
        if(arguments.length === 0 || typeof arguments[0] === 'object'){
            return this.each(function(){
                var $this = $(this)
                    , data = $this.data('mmGrid')
                    , options = $.extend(true, {}, $.fn.mmGrid.defaults, arguments[0]);
                if (!data) $this.data('mmGrid', new MMGrid(this, options))
            });
        }
        if(typeof arguments[0] === 'string'){
            var data = $(this).data('mmGrid');
            var func =  data[arguments[0]];
            if(func){
                return func.apply(data,arguments.slice(1));
            }
        }
    };

    $.fn.mmGrid.defaults = {
        width: 'auto'
        , height: '280px'
        , loadingText: '正在载入...'
        , noDataText: '没有数据'
        , fitCols: false
        , fitRows: false
    };

    $.fn.mmGrid.Constructor = MMGrid;

}(window.jQuery);