/**
 * User: meimeibw
 */

!function($){
    var MMGrid = function (element, options) {
        this._id = (((1 + Math.random()) * 0x10000) | 0).toString(16);
        this.opts = options;
        this._initLayout($(element));
        this._initHead();
        this._initOptions();
        this._initEvents();
        this._populate(options.items);
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
                    '<div class="mmg-bodyWrapper"></div>',
                    '<a class="mmg-btnBackboardDn"></a>',
                    '<div class="mmg-message">'+ this.opts.noDataText +'</div>',
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

        , _initHead: function(){
            var opts = this.opts;
            var $head = this.$head;

            if(opts.cols){
                var theadHtmls = ['<thead>'];

                for(var colIndex=0; colIndex< opts.cols.length; colIndex++){
                    var col = opts.cols[colIndex];
                    theadHtmls.push('<th class="');
                    theadHtmls.push(this._genColClass(colIndex));
                    theadHtmls.push(' nowrap">');
                    theadHtmls.push('<div class="mmg-titleWrapper" >');
                    theadHtmls.push('<span class="mmg-title ');
                    if(col.sortable) theadHtmls.push('mmg-canSort ');
                    theadHtmls.push('">');
                    theadHtmls.push(col.title);
                    theadHtmls.push('</span><div class="mmg-sort"></div>');
                    if(!col.lockWidth) theadHtmls.push('<div class="mmg-colResize"></div>');
                    theadHtmls.push('</div></th>');
                }

                theadHtmls.push('</thead>');
                $head.html(theadHtmls.join(''));
            }

            $.each($head.find('th'),function(index){
                $.data(this,'col-width',opts.cols[index].width);
            });

            var $mmGrid = this.$mmGrid;
            var $headWrapper = this.$headWrapper;
            var $bodyWrapper = this.$bodyWrapper;
            $bodyWrapper.height($mmGrid.height() - $headWrapper.outerHeight(true));

        }

        , _initOptions: function(){
            var opts = this.opts;
            var $mmGrid = this.$mmGrid;
            var $headWrapper = this.$headWrapper;
            var $backboard = this.$backboard;
            $mmGrid.find('a.mmg-btnBackboardDn').css({
                'top': $headWrapper.outerHeight(true)
            }).slideUp('fast');

            if(opts.cols){
                var bbHtml = ['<h1>显示列</h1>'];
                for(var colIndex=0; colIndex<opts.cols.length; colIndex++){
                    bbHtml.push('<label ');
                    if(opts.checkCol && colIndex===0){
                        bbHtml.push('style="display:none;" ');
                    }
                    var col = opts.cols[colIndex];
                    bbHtml.push('><input type="checkbox"  ');
                    if(!col.hidden) bbHtml.push('checked="checked"');
                    if(col.lockDisplay) bbHtml.push(' disabled="disabled"');
                    bbHtml.push('/><span>');
                    if(col.title){
                        bbHtml.push(col.title);
                    }else{
                        bbHtml.push('未命名');
                    }

                    bbHtml.push('</span></label>');
                }
                $backboard.append($(bbHtml.join('')));
            }
        }

        , _initEvents: function(){
            var that = this;
            var opts = this.opts;
            var $mmGrid = this.$mmGrid;
            var $headWrapper = this.$headWrapper;
            var $head = this.$head;
            var $bodyWrapper = this.$bodyWrapper;
            var $body = this.$body;
            var $backboard = this.$backboard;

            //调整浏览器
            if(opts.width === 'auto' || opts.height === 'auto' || (typeof opts.width === 'string' && opts.width.indexOf('%') === opts.width.length-1) ||
                typeof opts.height === 'string' && opts.height.indexOf('%') === opts.height.length-1){
                $(window).on('resize', function(){

                    //调整message
                    var $message = $mmGrid.find('.mmg-message');
                    if($message.is(':visible')){
                        $message.css({
                            'left': ($mmGrid.width() - $message.width()) / 2,
                            'top': ($mmGrid.height() + $headWrapper.height() - $message.height()) / 2
                        });
                    }
                    //调整loading
                    var $mask = $mmGrid.find('.mmg-mask');
                    if($mask.is(':visible')){
                        $mask.width($mmGrid.width()).height($mmGrid.height());
                        var $loadingWrapper = $mmGrid.find('.mmg-loading');
                        $loadingWrapper.css({
                            'left': ($mmGrid.width() - $loadingWrapper.width()) / 2,
                            'top': ($mmGrid.height() - $loadingWrapper.height()) / 2
                        })
                    }
                });
            }

            //滚动条事件
            $bodyWrapper.on('scroll', function(e){
                $head.css('left',- $(this).scrollLeft());
            });

            //向下按钮
            var $btnBackboardDn = $mmGrid.find('a.mmg-btnBackboardDn').on('click', function(){
                $backboard.height($mmGrid.height() - $headWrapper.outerHeight(true));
                $backboard.slideDown();
                $btnBackboardDn.slideUp('fast');
                that._hideNoData();
            });
            $body.on('mouseenter', function(){
                $btnBackboardDn.slideUp('fast');
            });
            $mmGrid.on('mouseleave', function(){
                $btnBackboardDn.slideUp('fast');
            });
            $headWrapper.on('mouseenter',function(){
                if($backboard.is(':hidden')){
                    $btnBackboardDn.slideDown('fast');
                }
            });
            //向上按钮
            $mmGrid.find('a.mmg-btnBackboardUp').on('click', function(){
                $backboard.slideUp().queue(function(next){
                    if(!that.size()){
                        that._showNoData();
                    }
                    next();
                });
            });

            //隐藏列
            $backboard.on('click', ':checkbox', function(e){
                var index = $backboard.find('label').index($(this).parent());
                if(this.checked){
                    opts.cols[index].hidden = false;
                    that._setColsWidth();
                }else{
                    opts.cols[index].hidden = true;
                    that._setColsWidth();
                }
            });

            $head.on('click', '.mmg-title', function(){

            }).on('mousedown', '.mmg-colResize', function(e){
                //调整列宽
                var $resize = $(this);
                var start = e.pageX;
                var $colResizePointer = $headWrapper.find('.mmg-colResizePointer')
                    .css('left', e.pageX - $headWrapper.offset().left).show();
                //取消文字选择
                document.body.onselectstart = function () {
                    return false;
                };
                $headWrapper.css('-moz-user-select','none');

                $headWrapper.on('mousemove', function(e){
                    $colResizePointer.css('left', e.pageX - $headWrapper.offset().left);
                }).on('mouseup', function(e){
                    //改变宽度
                    var $th = $resize.parent().parent();
                    var width = $th.width() + e.pageX - start;
                    $.data($th[0], 'col-width', width);
                    that._setColsWidth();
                    $headWrapper.mouseleave();
                }).on('mouseleave',function(){
                    $headWrapper.off('mouseup').off('mouseleave').off('mousemove');
                        $colResizePointer.hide();
                    document.body.onselectstart = function(){
                        return true;//开启文字选择
                    };
                    $headWrapper.css('-moz-user-select','text');
                });
            });

        }
        , _populate: function(items){
            var opts = this.opts;
            var $body = this.$body;

            this._hideNoData();
            if(items && items.length !== 0 && opts.cols){
                var tbodyHtmls = [];
                tbodyHtmls.push('<tbody>');
                for(var rowIndex=0; rowIndex < items.length; rowIndex++){
                    var item = items[rowIndex];

                    tbodyHtmls.push('<tr data-rowIndex="');
                    tbodyHtmls.push(rowIndex);
                    tbodyHtmls.push('">');
                    for(var colIndex=0; colIndex < opts.cols.length; colIndex++){
                        var col = opts.cols[colIndex];
                        tbodyHtmls.push('<td class="');
                        tbodyHtmls.push(this._genColClass(colIndex));
                        if(opts.nowrap){
                            tbodyHtmls.push(' nowrap');
                        }
                        tbodyHtmls.push('"><span class="');
                        if(opts.nowrap){
                            tbodyHtmls.push('nowrap');
                        }
                        tbodyHtmls.push('">');
                        if(col.renderer){
                            tbodyHtmls.push(col.renderer(item[col.name],item,items,rowIndex));
                        }else{
                            tbodyHtmls.push(item[col.name]);
                        }

                        tbodyHtmls.push('</span></td>');
                    };
                    tbodyHtmls.push('</tr>');
                }
                tbodyHtmls.push('</tbody>');
                $body.empty().html(tbodyHtmls.join(''));
                var $trs = $body.find('tr');
                for(var rowIndex=0; rowIndex < items.length; rowIndex++){
                    $.data($trs.eq(rowIndex)[0],'item',items[rowIndex]);
                }
            }else{
                $body.empty().html('<tbody><td style="border: 0px;background: none;">&nbsp;</td></tbody>');
                this._showNoData();
            }
            this._setStyle();
            this._setColsWidth();

            this._hideLoading();
        }

        /* 生成列类 */
        , _genColClass: function(colIndex){
            return 'mmg'+ this._id +'-col'+colIndex;
        }

        , _setStyle: function(){
            var $head = this.$head;
            var $ths = $head.find('th');
            var $body = this.$body;

            //head
            $ths.eq(0).addClass('first');
            $ths.eq(-1).addClass('last');
            //body
            $body.find('tr,td').removeClass('even')
                .removeClass('colSelected').removeClass('colSelectedEven');

            $body.find('tr:odd').addClass('even');

            var sortIndex = $head.find('.mmg-title').index($head.find('.mmg-title').filter(function(){
                return $.data(this,'sortStatus') === 'asc' || $(this).data('sortStatus') === 'desc';
            }));

            $body.find('tr > td:nth-child('+(sortIndex+1)+')').addClass('colSelected')
                .filter(':odd').addClass('colSelectedEven');

        }
        , _setColsWidth: function(){
            var opts = this.opts;
            var $style = this.$style;
            var $head = this.$head;
            var $ths = $head.find('th');
            var $bodyWrapper = this.$bodyWrapper;
            var $body = this.$body;

            $bodyWrapper.width(9999);
            $body.width('auto');
            var styleText = [];
            for(var colIndex=0; colIndex<$ths.length; colIndex++){
                var $th = $ths.eq(colIndex);
                styleText.push('.mmGrid .'+this._genColClass(colIndex) + ' {');
                var width = $.data($th[0],'col-width');
                styleText.push('width: '+ width +'px;');
                styleText.push('max-width: '+ width +'px;');
                if(opts.cols[colIndex].align){
                    styleText.push('text-align: '+opts.cols[colIndex].align+';');
                }
                if(opts.cols[colIndex].hidden){
                    styleText.push('display: none; ');
                }
                styleText.push(' }');
            }

            $body.detach();
            try{
                $style.text(styleText.join(''));
            }catch(error){
                $style[0].styleSheet.cssText = styleText.join('');//IE fix
            }
            $body.width($head.width());
            $bodyWrapper.width('100%');
            $bodyWrapper.append($body);
        }
        , _showLoading: function(){
            var $mmGrid = this.$mmGrid;
            $mmGrid.find('.mmg-mask').show();

            var $loading = $mmGrid.find('.mmg-loading');
            $loading.css({
                'left': ($mmGrid.width() - $loading.width()) / 2,
                'top': ($mmGrid.height() - $loading.height()) / 2
            }).show();
        }
        , _hideLoading: function(){
            var $mmGrid = this.$mmGrid;
            $mmGrid.find('.mmg-mask').hide();
            $mmGrid.find('.mmg-loading').hide();
        }
        , _showNoData: function(){
            this._showMessage(this.opts.noDataText);
        }
        , _hideNoData: function(){
            this._hideMessage();
        }

        , _showMessage: function(msg){
            var $mmGrid = this.$mmGrid;
            var $headWrapper = this.$headWrapper;
            var $message = $mmGrid.find('.mmg-message');
            $message.css({
                'left': ($mmGrid.width() - $message.width()) / 2,
                'top': ($mmGrid.height() + $headWrapper.height()  - $message.height()) / 2
            }).text(msg).show();
        }
        , _hideMessage: function(){
            var $mmGrid = this.$mmGrid;
            $mmGrid.find('.mmg-message').hide();
        }

        , size: function(){
            var $trs = this.$body.find('tr');
            if($trs.length === 1){
                var item = $.data($trs[0],'item');
                if(item){
                    return 1;
                }
                return 0;
            }
            return $trs.length;
        }
    };

    $.fn.mmGrid = function(){
        if(arguments.length === 0 || typeof arguments[0] === 'object'){
            var option = arguments[0];
            return this.each(function(){
                var $this = $(this)
                    , data = $this.data('mmGrid')
                    , options = $.extend(true, {}, $.fn.mmGrid.defaults, option);
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
        , cols: []
        , items: []
        , loadingText: '正在载入...'
        , noDataText: '没有数据'
        , fitCols: false
        , fitRows: false
        , nowrap: false
    };

    $.fn.mmGrid.Constructor = MMGrid;

}(window.jQuery);