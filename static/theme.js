/*
 * Javascript for dangopress theme
 */

/*
 * Include comment-reply.js
 * See: https://codex.wordpress.org/Function_Reference/comment_reply_link
 */
var addComment = {
	moveForm: function( commId, parentId, respondId, postId ) {
		var div, element, style, cssHidden,
			t           = this,
			comm        = t.I( commId ),
			respond     = t.I( respondId ),
			cancel      = t.I( 'cancel-comment-reply-link' ),
			parent      = t.I( 'comment_parent' ),
			post        = t.I( 'comment_post_ID' ),
			commentForm = respond.getElementsByTagName( 'form' )[0];

		if ( ! comm || ! respond || ! cancel || ! parent || ! commentForm ) {
			return;
		}

		t.respondId = respondId;
		postId = postId || false;

		if ( ! t.I( 'wp-temp-form-div' ) ) {
			div = document.createElement( 'div' );
			div.id = 'wp-temp-form-div';
			div.style.display = 'none';
			respond.parentNode.insertBefore( div, respond );
		}

		comm.parentNode.insertBefore( respond, comm.nextSibling );
		if ( post && postId ) {
			post.value = postId;
		}
		parent.value = parentId;
		cancel.style.display = '';

		cancel.onclick = function() {
			var t       = addComment,
				temp    = t.I( 'wp-temp-form-div' ),
				respond = t.I( t.respondId );

			if ( ! temp || ! respond ) {
				return;
			}

			t.I( 'comment_parent' ).value = '0';
			temp.parentNode.insertBefore( respond, temp );
			temp.parentNode.removeChild( temp );
			this.style.display = 'none';
			this.onclick = null;
			return false;
		};

		/*
		 * Set initial focus to the first form focusable element.
		 * Try/catch used just to avoid errors in IE 7- which return visibility
		 * 'inherit' when the visibility value is inherited from an ancestor.
		 */
		try {
			for ( var i = 0; i < commentForm.elements.length; i++ ) {
				element = commentForm.elements[i];
				cssHidden = false;

				// Modern browsers.
				if ( 'getComputedStyle' in window ) {
					style = window.getComputedStyle( element );
				// IE 8.
				} else if ( document.documentElement.currentStyle ) {
					style = element.currentStyle;
				}

				/*
				 * For display none, do the same thing jQuery does. For visibility,
				 * check the element computed style since browsers are already doing
				 * the job for us. In fact, the visibility computed style is the actual
				 * computed value and already takes into account the element ancestors.
				 */
				if ( ( element.offsetWidth <= 0 && element.offsetHeight <= 0 ) || style.visibility === 'hidden' ) {
					cssHidden = true;
				}

				// Skip form elements that are hidden or disabled.
				if ( 'hidden' === element.type || element.disabled || cssHidden ) {
					continue;
				}

				element.focus();
				// Stop after the first focusable element.
				break;
			}

		} catch( er ) {}

		return false;
	},

	I: function( id ) {
		return document.getElementById( id );
	}
};

/**
 * SidebarFollow
 *
 * @author: mg12 [http://www.neoease.com/]
 * @update: 2012/12/05
 */
SidebarFollow = function() {
    this.config = {
        element: null, // 处理的节点
        distanceToTop: 0 // 节点上边到页面顶部的距离
    };

    this.cache = {
        originalToTop: 0, // 原本到页面顶部的距离
        prevElement: null, // 上一个节点
        parentToTop: 0, // 父节点的上边到顶部距离
        placeholder: jQuery('<div>') // 占位节点
    }
};

SidebarFollow.prototype = {
    init: function(config) {
        this.config = config || this.config;
        var _self = this;
        var element = jQuery(_self.config.element);

        // 如果没有找到节点, 不进行处理
        if(element.length <= 0) {
            return;
        }

        // 获取上一个节点
        var prevElement = element.prev();
        while(prevElement.is(':hidden')) {
            prevElement = prevElement.prev();
            if(prevElement.length <= 0) {
                break;
            }
        }
        _self.cache.prevElement = prevElement;

        // 计算父节点的上边到顶部距离
        var parent = element.parent();
        var parentToTop = parent.offset().top;
        var parentBorderTop = parseFloat(parent.css('border-top-width'), 10);
        var parentPaddingTop = parseFloat(parent.css('padding-top'), 10);
        _self.cache.parentToTop = parentToTop + parentBorderTop + parentPaddingTop;

        // 滚动屏幕
        jQuery(window).scroll(function() {
            _self._scrollScreen({element:element, _self:_self});
        });

        // 改变屏幕尺寸
        jQuery(window).resize(function() {
            _self._scrollScreen({element:element, _self:_self});
        });
    },

    /**
     * 修改节点位置
     */
    _scrollScreen: function(args) {
        var _self = args._self;
        var element = args.element;
        var prevElement = _self.cache.prevElement;

        if (element.is(':hidden'))
            return;

        // 获得到顶部的距离
        var toTop = _self.config.distanceToTop;

        // 如果 body 有 top 属性, 消除这些位移
        var bodyToTop = parseFloat(jQuery('body').css('top'), 10);
        if(!isNaN(bodyToTop)) {
            toTop += bodyToTop;
        }

        // 获得到顶部的绝对距离
        var elementToTop = element.offset().top - toTop;

        // 如果存在上一个节点, 获得到上一个节点的距离; 否则计算到父节点顶部的距离
        var referenceToTop = 0;
        if(prevElement && prevElement.length === 1) {
            referenceToTop = prevElement.offset().top + prevElement.outerHeight();
        } else {
            referenceToTop = _self.cache.parentToTop - toTop;
        }

        // 当节点进入跟随区域, 跟随滚动
        if(jQuery(document).scrollTop() > elementToTop) {
            // 添加占位节点
            var elementHeight = element.outerHeight();
            _self.cache.placeholder.css('height', elementHeight).insertBefore(element);
            // 记录原位置
            _self.cache.originalToTop = elementToTop;
            // 修改样式
            element.css({
                top: toTop + 'px',
                position: 'fixed'
            });

        // 否则回到原位
        } else if(_self.cache.originalToTop > elementToTop || referenceToTop > elementToTop) {
            // 删除占位节点
            _self.cache.placeholder.remove();
            // 修改样式
            element.css({
                position: 'static'
            });
        }
    }
};

/*
 * Initialize the function
 */
jQuery(function($) {
    /* scroll back to top */
    $(".backtop").click(function(event){
        event.preventDefault();
        $('html,body').animate({ scrollTop:0 }, 'fast');
    });

    /* Sidebar tabber widget */
    $('.tabber-title li').click(function() {
        if (this.className == 'selected')
             return;

        var $cur_tab = $(this);
        var $tabber = $cur_tab.parents('.widget-tabber');

        $cur_tab.addClass("selected")
                .siblings().removeClass("selected");

        $tabber.find('.tabber-content ul').slideUp('fast')
               .eq($tabber.find('.tabber-title li').index(this)).slideDown('fast');
    });

    /* Sidebar follow */
    (new SidebarFollow()).init({
        element: '#sidebar-follow',
        distanceToTop: 70
    });

    /* Mobile menu switch */
    $('#mobile-menu').click(function() {
        var $header = $('#header');
        var $menu = $header.find('.header-menu');
        var $searchbox = $header.find('.search-box')

        $searchbox.fadeToggle();

        if ($header.hasClass('clicked')) {
            $menu.slideToggle(function() {
                $header.removeClass('clicked');
            });
        } else {
            $header.addClass('clicked');
            $menu.slideToggle();
        }
    });

    /* Comment tabber */
    $('#comments-tabber a').on('click', function() {
         if (this.className == 'curtab')
             return;

         $(this).attr('class', 'curtab')
               .siblings().attr('class', 'tab');

         $('#comments-tabber').nextAll().toggle();
    });

    /* Toggle comment user */
    $('#comments').on('click', '#toggle-author', function () {
        $('#author-info').slideToggle(function () {
            if ($(this).is(':hidden')) {
                /* Update author name in the welcome messages */
                $('#welcome-login strong').html($('#author').val());

                /* Update the toggle action name */
                $('#toggle-author u').html('更改');
            } else {
                /* Update the toggle action name */
                $('#toggle-author u').html('隐藏');
            }
        });
    });

    $('.comment-reply-link').click(function () {
        var commentId = $(this).attr('data-commentid');
        addComment.moveForm("comment-" + commentId, commentId, "respond", $(this).attr('data-postid'));
        return false;
    });

    /*
     * Dynamically fill the google adsense ads
     */
    $(".adsbygoogle:visible").each(function () { (adsbygoogle = window.adsbygoogle || []).push({}); });
});
