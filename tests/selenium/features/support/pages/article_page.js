/**
 * Represents a generic article page
 *
 * @extends MinervaPage
 * @example
 * https://en.m.wikipedia.org/wiki/Barack_Obama
 */

const MinervaPage = require( './minerva_page' );

class ArticlePage extends MinervaPage {

	get notifications_button_element() { return $( '.user-button' ); }
	get category_element() { return $( '.category-button' ); }
	get edit_link_element() { return $( '#ca-edit' ); }
	get first_heading_element() { return $( '#section_0' ); }
	get notification_element() { return $( '.mw-notification-area .mw-notification' ); }
	get overlay_heading_element() { return $( '.overlay-title h2' ); }
	get overlay_category_topic_item_element() { return $( '.topic-title-list li' ); }
	get red_link_element() { return $( 'a.new' ); }
	get is_authenticated_element() { return $( 'body.is-authenticated' ); }
	get last_modified_bar_history_link_element() { return $( '.last-modifier-tagline a[href*=\'Special:History\']' ); }

}

module.exports = new ArticlePage();
