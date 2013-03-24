!function($){
    var MMPaginator = function(element, options){
        this.$el = $(element);
        this.opts = options;
        //this._initLayout();

//        var params = {};
//        params[options.totalCountName] = 0;
//        params[options.pageNoName] = 0;
//        this.load(params);
    };

    MMPaginator.prototype = {
        _initLayout: function(){
            var that = this;
            var $el = this.$el;
            var opts = this.opts;

            $el.addClass("mmPaginator");
            var pgHtmls = [
                '<div class="totalCountLabel"></div>',
                '<ul class="pageNoList"></ul>',
                '<div class="pageSize"><select></select></div>'
            ];
            $el.append($(pgHtmls.join('')));

            this.$totalCountLabel = $el.find('.totalCountLabel');
            this.$pageNoList = $el.find('.pageNoList');
            this.$pageSizeList = $el.find('.pageSize select');

             var $pageSizeList = this.$pageSizeList
            $.each(opts.pageSizeList, function(){
                var $option = $('<option></option>')
                    .prop('value',this)
                    .text(that.formatString(opts.pageSizeLabel,[this]));
                $pageSizeList.append($option);
            });

            $pageSizeList.on('change', function(){
                that.$mmGrid.load();
            });

        }

        , _plain: function(pageNo, totalCount, pageSize){
            var that = this;
            var $el = this.$el;
            var $pageNoList = this.$pageNoList;

            var totalPage = totalCount % pageSize === 0 ? parseInt(totalCount/pageSize) : parseInt(totalCount/pageSize) + 1;
            totalPage = totalPage ? totalPage : 0;
            if(totalPage === 0){
                pageNo = 0;
            }else if(pageNo > totalPage){
                pageNo = totalPage;
            }else if(pageNo < 1 && totalPage != 0){
                pageNo = 0;
            }
            //
            var $prev = $('<li><a>«</a></li>');
            if(pageNo<=0){
                $prev.addClass('disable');
            }else{
                $prev.find('a').on('click', function(){
                    $el.data('pageNo', pageNo-1);
                    that.$mmGrid.load();
                });
            }
            $pageNoList.append($prev);
            /////
            var list = [1];
            if(pageNo+1 > 4 ){
                list.push('...');
            }
            for(var i= 0; i < 5; i++){
                var no = pageNo - 1 + i;
                if(no > 1 && no <= totalPage-1){
                    list.push(no);
                }
            }
            if(pageNo+2 < totalPage-1){
                list.push('...');
            }
            if(totalPage>1){
                list.push(totalPage);
            }
            $.each(list, function(index, item){
                var $li = $('<li><a></a></li>');
                if(item === '...'){
                    $li.addClass('active').find('a').text('...');
                }else if(item === pageNo+1){
                    $li.addClass('active').find('a').text(item);
                }else{
                    $li.find('a').text(item).prop('title','第'+item+'页').on('click', function(e){
                        $el.data('pageNo', item-1);
                        that.$mmGrid.load();
                    });
                }
                $pageNoList.append($li);
            });
            //
            var $next = $('<li><a title="下一页">»</a></li>');
            if(pageNo+1>=totalPage){
                $next.addClass('disable');
            }else{
                $next.find('a').on('click', function(){
                    $el.data('pageNo', pageNo+1);
                    that.$mmGrid.load();
                });
            }
            $pageNoList.append($next);
        }

        , _search: function(pageNo, totalCount, pageSize){

        }

        , load: function(params){
            var $el = this.$el;
            var $pageSizeList = this.$pageSizeList;
            var opts = this.opts;

            var pageNo = params[opts.pageNoName];
            if(pageNo === undefined){
                pageNo = $el.data('pageNo');
            }
            $el.data('pageNo', pageNo);

            var totalCount = params[opts.totalCountName];
            if(totalCount === undefined){
                totalCount = 0;
            }
            $el.data('totalCount', totalCount);

            var pageSize = params[opts.pageSizeName];
            if(pageSize === undefined){
                pageSize = $pageSizeList.val();
            }
            this.$pageSizeList.val(pageSize);

            this.$totalCountLabel.html(this.formatString(opts.totalCountLabel,[totalCount]));
            this.$pageNoList.empty();

            this._plain(pageNo, totalCount, this.$pageSizeList.val());
        }

        , formatString: function(text, args){
            return text.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        }

        , params: function(){
            var opts = this.opts;
            var $el = this.$el;
            var $pageSizeList = this.$pageSizeList;

            var params = {};
            params[opts.pageNoName] = $el.data('pageNo');
            params[opts.pageSizeName] = $pageSizeList.val();
            return params;
        }

        , init: function($grid){
            var that = this;
            var opts = that.opts;
            this.$mmGrid = $grid;
            this._initLayout();
            this.$mmGrid.on('loadSuccess', function(e, data){
                that.load(data);
            });

            var params = {};
            params[opts.totalCountName] = 0;
            params[opts.pageNoName] = 0;
            this.load(params);

            if($grid.opts.indexCol){
                var indexCol = $grid.opts.cols[0];
                indexCol.renderer = function(val,item,rowIndex){
                    var params = that.params();
                    return '<label class="index">' +
                        (rowIndex + (params[opts.pageNoName] * params[opts.pageSizeName])) +
                        '</label>';
                };
            }

        }

    };

    $.fn.mmPaginator = function(){

        if(arguments.length === 0 || typeof arguments[0] === 'object'){
            var option = arguments[0]
                , data = this.data('mmPaginator')
                , options = $.extend(true, {}, $.fn.mmPaginator.defaults, option);
            if (!data) {
                data = new MMPaginator(this[0], options);
                this.data('mmPaginator', data);
            }
            return $.extend(true, this, data);
        }
        if(typeof arguments[0] === 'string'){
            var data = this.data('mmPaginator');
            var fn =  data[arguments[0]];
            if(fn){
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(data,args.slice(1));
            }
        }
    };

    $.fn.mmPaginator.defaults = {
         style: 'plain'
        , totalCountName: 'totalCount'
        , pageNoName: 'page'
        , pageSizeName: 'limit'
        , pageSizeLabel: '每页{0}条'
        , totalCountLabel: '共<span>{0}</span>条记录'
        , pageSizeList: [10, 20, 30, 40, 50]
    };

    $.fn.mmPaginator.Constructor = MMPaginator;

}(window.jQuery);