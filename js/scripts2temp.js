var currentItem = null;
var currentItemIndex = null;
var items = [];
var nonItemPages = ['home','list','search'];
// run once for the app
$(function() {
	$(window).bind('orientationchange', function (e) {
		setTimeout(function () {
			e.orientation == 'landscape' ? $('body').addClass('landscape') : $('body').removeClass('landscape');
			resetLayout();
		}, 200);
	});
	$(window).bind('resize', function (e) {
		//console.log('resized');
		resetLayout();
	});
	setListHeight();
	// load up the item thumbnails and pages
	loadItems();
	setTimeout(function () {
		$.mobile.changePage("#list", "fade");
	}, 4000);
	if (items.length == 0) {// load all the items into an array
		$('#list .content a').each(function (i,item) {
			items.push($(this).attr('href').substring(1));
		});
	}
	$('.item .content img.main').bind('tap',function (e) {
		$('body').toggleClass('fullscreen');
		setImgOrientation();
	});
	$('.item .content img').bind('swiperight',function (e) {
		//console.log('swiperight, currentItemIndex: '+currentItemIndex);
		if (currentItemIndex != 0) {
			var previousItem = items[currentItemIndex-1];
			//console.log('previousItem: '+previousItem);
			$.mobile.changePage("#"+previousItem, {transition: 'pop'});
		}
	});
	$('.item .content img').bind('swipeleft',function (e) {
		//console.log('swipeleft, currentItemIndex: '+currentItemIndex);
		if (currentItemIndex != items.length) {
			//console.log(items);
			var nextItem = items[parseInt(currentItemIndex)+1];
			//console.log('nextItem: '+nextItem);
			$.mobile.changePage("#"+nextItem, { transition: 'pop' });
		}
	});
	$('.alt_imgs a').click(function () {
		var thumbId = $(this).attr('id');
		var pageId = thumbId.split('_')[0];
		var imgIdx = thumbId.split('_')[1];
		var item = getItem(pageId);
		if (item!=-1 && typeof(item.img[imgIdx])!='undefined') {
			$('#'+pageId+' .content img.main').attr('src',item.img[imgIdx]);
			setImgOrientation();
			$(this).siblings().removeClass('on');
			$(this).addClass('on');
		}
	});
});
$(document).bind('pageshow', function () {
	//console.log('pageshow, $.mobile.activePage.attr(\'id\'): '+$.mobile.activePage.attr('id'));
	if (isItemPage()) {
		currentItemIndex = getCurrentItemIndex($.mobile.activePage.attr('id'));
		setImgOrientation();
	}
	//console.log('currentItemIndex: '+currentItemIndex);
});
function setImgOrientation() {
	var page = null;
	if (arguments.length>0) {
		page = arguments[0];
	} else {
		page = $.mobile.activePage.attr('id');
	}
	var contentAreaWidth = $(window).width();
	var contentAreaHeight = $(window).height();
	if (!$('body').hasClass('fullscreen')) {
		contentAreaHeight -= $('#'+page+' .ui-header').height();
	}
	var contentAreaRatio = contentAreaHeight/contentAreaWidth;
	var contentImg = $('#'+page+' .content img.main');
	
	if (contentImg.height()/contentImg.width()>contentAreaRatio) {
		contentImg.height(contentAreaHeight);
		contentImg.css('width','auto');
	} else {
		contentImg.width(contentAreaWidth);
		contentImg.css('height','auto');
	}
	contentImg.css('visibility','visible');
}
function resetLayout() {
	if (isItemPage ()) {
		setImgOrientation();
	} else if ($.mobile.activePage.attr('id')=='list') {
		setListHeight();
	}
}
function setListHeight () {
	var contentAreaHeight = $(window).height();
	if (!$('body').hasClass('fullscreen')) {
		contentAreaHeight -= $('#list .ui-header').height();
	}
	$('#list .content').height(contentAreaHeight);
}
function isItemPage () {
	var onItemPage = true;
	for (pg in nonItemPages) {
		if (nonItemPages[pg] == $.mobile.activePage.attr('id')) onItemPage = false;  
	}
	return onItemPage;
}
function getCurrentItemIndex(item) {
	for(i in items) {
		if (items[i]==item) return i;
	}
	return -1;
}
function getItem(itemId) {
	for (i in itemData) {
		if (typeof(itemData[i].id)!='undefined' && itemData[i].id==itemId) {
			return itemData[i];
		}
	}
	return -1;
}
function loadItems() {
	$.each(itemData,function (i, item) {
		//console.log('i:'+i);
		//console.log('item:'+item);
		// add an item page link to the list page
		var listTitle = typeof(item.sm_title)!='undefined'?item.sm_title:item.title;
		$('#list .content').append('<a href="#'+item.id+'" title="'+item.title+'"><img src="'+item.sm_img[0]+'" />'+listTitle.substring(0,14)+'</a>');
		// create the page html
		var itemPgHtml = '';
		itemPgHtml += '<div data-role="page" id="'+item.id+'" class="item" data-title="Item Detail" data-theme="b" data-position="fixed">';
			itemPgHtml += '<div data-role="header" data-position="inline" data-theme="b">';
				itemPgHtml += '<a href="#list" data-direction="back" data-icon="grid" data-iconpos="notext">list</a>';
				itemPgHtml += '<h1 class="header-logo">NatureScount</h1>';
				itemPgHtml += '<a href="javascript:;" data-icon="search" data-iconpos="notext">Search</a>';
			itemPgHtml += '</div><!-- /header -->';
			itemPgHtml += '<div data-role="content">';
				itemPgHtml += '<div class="content">';
					itemPgHtml += '<img src="'+item.img[0]+'" class="main" />';
					itemPgHtml += '<div class="details">';
						itemPgHtml += '<h2>'+item.title+'</h2>';
						var altImgs = '';
						if (item.sm_img.length>1) {
							altImgs += '<div class="alt_imgs">';
							for (var img=0;img<item.sm_img.length;img++) {
								altImgs += '<a href="javascript:;" id="'+item.id+'_'+img+'"'+(img==0?' class="on"':'')+'><img src="'+item.sm_img[img]+'" /></a>';
							}
							altImgs += '</div>';
						}
						itemPgHtml += altImgs;
						itemPgHtml += '<p>'+item.desc+'</p>';
					itemPgHtml += '</div>';
				itemPgHtml += '</div>';
			itemPgHtml += '</div>';
		itemPgHtml += '</div>';
		// add the pg html to the body
		$('body').append(itemPgHtml);
	});
} 
