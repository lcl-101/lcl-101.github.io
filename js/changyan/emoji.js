/**
 * 表情 loader
 *
 * @version 20131223
 */

(function($) {

    var plugin = 'emoji', // 插件名

    Emoji = {}, // 保存一些数据

    loadUrl = $.Host + '/api/labs/emoji/load', // 第一次加载url

    spUrl = $.Host + '/api/labs/emoji/support'; // 表情投票url

    sayMoreUrl = $.Host + '/api/labs/emoji/saymore'; //表情点击完发评论统计

    var $emoji = $.container('cyEmoji');
    $.loadData(loadUrl, function(data) {
        if (!data.status) {
            var number = data.number || 5; // 表情个数
            Emoji.tid = data.tid;
            Emoji.list = data.list;
            // $.loadCss(data.css);
            $.loadCss($.CDN+'/css/plugin/emoji.css');
            $emoji.html(data.html);
            var w = data.width;
            if(w==0){
            	w = $emoji.width() / number;
            }
            var hoverWave = data.hoverWave;
            $emoji.find('.emoji-item').each(function(i) {
                $(this).css({
                	'width' : w-1 //留出hover的空余来
                }).on({
                    'mouseenter' : function() {
                    	var _w = $(this).width();
                    	var _h = $(this).height();
                        $(this).css({
                        	'width': _w - 2,
                        	'height': _h - 2});
                        if(hoverWave == 1) {
                            $(this).css({
                            	'padding-top': '9px',
                            	'padding-bottom': '9px'});
                        }
                        $(this).addClass('emoji-hover');
                    },
                    'mouseleave' : function() {
                    	var _w = $(this).width();
                    	var _h = $(this).height();
                        $(this).removeClass('emoji-hover').css({
                        	'width': _w + 2,
                        	'height': _h + 2});
                        if(hoverWave == 1) {
	                        $(this).css({
	                        	'padding-top': '10px',
	                        	'padding-bottom': '10px'});
                    	}
                    }
                });
            });

            var eventData = {};
            eventData.callback = saymore.popup;
            $emoji.find('.emoji-list .emoji-item').on('click', eventData, support);
        }
    });

    $.loadConfig(plugin, function(data) {
        Emoji.config = data.data;
    });

    function support(event) {
        var $this = $(this);
        if ($('#SOHUCS').find('.wrap-text-f').length > 0) {
            $('#SOHUCS').find('.wrap-text-f').trigger('click');
        }
        if ($this.data('agree')) {
            return;
        }
        var eid = $this.data('eid');
        $.ajax({
            'type' : 'GET',
            'url' : spUrl,
            'data' : {
                'client_id' : $.appid,
                'topic_id' : Emoji.tid,
                'emoji_id' : eid,
                'topic_url' : $.url,
                'topic_source_id' : $.sid || ''
            },
            'success' : function(data) {
                $this.data('num', $this.data('num') + 1);
                $this.data('agree', true);
                $this.find('.emoji-num').text($this.data('num') + '人');
                // +1
                $.plus1($emoji, $this);
                var callback = event.data['callback'];
                if (callback) {
                    callback.call(saymore, $this);
                }
            },
            'dataType' : 'jsonp',
            'scriptCharset' : 'utf-8'
        });
    }

    var Saymore = function() {
        this.template = ''
                + '<div class="saymore">'
                + '<div class="saymore-slogan">'
                + '<a href="javascript:void(0)" class="saymore-close"></a>'
                + '<span>文字比表情更深刻，更有力</span>'
                + '</div>'
                + '<div class="" style="padding: 0 0 30px 17px;">'
                + '<div class="saymore-tip">'
                + '<img width="16" height="13" src="//comment.news.sohu.com/upload/comment4_1/images/bq_23.png">表情发表成功，您可以继续说两句：'
                + '</div>'
                + '<div class="saymore-post">'
                + '<input type="text" maxlength="100" value="" class="saymore-text"><button type="button" class="saymore-button">评&nbsp;论</button>'
                + '</div>' + '<div class="saymore-error"></div>' + '</div>' + '</div>';
    };

    Saymore.prototype = {
        popup : function(emoji) {
            if (typeof SOHUCS == 'undefined' || Emoji.config['comment'] == '0') {
                return;
            }
            var _this = this;
            var $saymore = $('#cyEmoji .saymore');
            if ($saymore.length == 0) {
                $saymore = $(_this.template);
                var pw = parseInt($emoji.width());
                $saymore.css({
                    'top' : '40px',
                    'left' : (pw - 320) / 2 + 'px'
                });
                $emoji.append($saymore);
                $saymore.find('.saymore-close').on('click', function() {
                    _this.destory.call(_this);
                });
                $saymore.find('.saymore-button').on('click', function() {
                    _this.postComment.call(_this);
                });
            }

            var $input = $saymore.find('.saymore-text');
            if (Emoji.config && Emoji.config['preascomment'] == '1') {
                $input.val(emoji.data('desc'));
            } else {
                $input.attr('placeholder', emoji.data('desc')).focus();
            }
        },
        postComment : function() {
            var $saymore = $('#cyEmoji .saymore');
            var $input = $saymore.find('.saymore-text');
            var val = $input.val();
            if (val) {
                $('#SOHUCS textarea[node-type="textarea"]').val(val);
                // $('#SOHUCS button[class="btn-fw btn-bf btn-fw-main"]').click();
                $('#SOHUCS button.btn-fw-main,#SOHUCS button[node-type="issue"]').click();

                //日志记录
                $.ajax({
                   type : "get",
                   url : sayMoreUrl,
                   dataType : 'jsonp',
                   data : {
                   'client_id' : $.appid
                   },
                   success : function(json) {}
                 });
            }
            this.destory();
        },
        destory : function() {
            $('#cyEmoji .saymore').remove();
        }
    };

    var saymore = new Saymore();

})(jChangyan);
