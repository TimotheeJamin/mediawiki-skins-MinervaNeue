( function ( M, mwConfig, mwNow, mwTrack, mwTrackSubscribe, mwUser ) {
	var
		util = M.require( 'mobile.startup/util' ),
		EVENT_PAGE_ISSUE_LOG = 'minerva.PageIssuesAB';

	/**
	 * @param {boolean} newTreatmentEnabled
	 * @param {number} namespaceId The namespace for the page that has issues.
	 * @param {string[]} pageIssueSeverities An array of PageIssue severities.
	 * @return {Object} A Partial<Schema:PageIssues> Object meant to be mixed with track data.
	 */
	function newPageIssueSchemaData( newTreatmentEnabled, namespaceId, pageIssueSeverities ) {
		return {
			pageTitle: mwConfig.get( 'wgTitle' ),
			namespaceId: namespaceId,
			pageIdSource: mwConfig.get( 'wgArticleId' ),
			issuesVersion: bucketToVersion( newTreatmentEnabled ),
			issuesSeverity: pageIssueSeverities,
			isAnon: mwUser.isAnon(),
			editCountBucket: getUserEditBuckets(),
			pageToken: mwUser.generateRandomSessionId() + Math.floor( mwNow() ).toString(),
			sessionToken: mwUser.sessionId()
		};
	}

	/**
   * Enable tracking.
	 * @param {boolean} newTreatmentEnabled
	 * @param {Object} pageIssueSchemaData A Partial<Schema:PageIssues> Object that will be mixed with
	 *                                     with track data.
	 * @return {void}
	 */
	function subscribe( newTreatmentEnabled, pageIssueSchemaData ) {
		// intermediary event bus that extends the event data before being passed to event-logging.
		mwTrackSubscribe( EVENT_PAGE_ISSUE_LOG, function ( topic, data ) {
			var mixedData = util.extend( {}, pageIssueSchemaData, data );

			// Log readingDepth schema.(ReadingDepth is guarded against multiple enables).
			// See https://gerrit.wikimedia.org/r/#/c/mediawiki/extensions/WikimediaEvents/+/437686/
			mwTrack( 'wikimedia.event.ReadingDepthSchema.enable', bucketToGroup( newTreatmentEnabled ) );
			// Log PageIssues schema.
			mwTrack( 'wikimedia.event.PageIssues', mixedData );
		} );
	}

	/**
	 * @param {boolean} newTreatmentEnabled
	 * @return {string} The page issues group associated with the treatment bucket.
	 */
	function bucketToGroup( newTreatmentEnabled ) {
		return newTreatmentEnabled ? 'page-issues-b_sample' : 'page-issues-a_sample';
	}

	/**
	 * @param {boolean} newTreatmentEnabled
	 * @return {string} The page issues version associated with the treatment bucket.
	 */
	function bucketToVersion( newTreatmentEnabled ) {
		return newTreatmentEnabled ? 'new2018' : 'old';
	}

	/**
	 * Converts user edit count into a predefined string. Note: these buckets have *nothing* to do
   * with A/B bucketing.
	 * @return {string}
	 */
	function getUserEditBuckets() {
		var editCount = mwConfig.get( 'wgUserEditCount', 0 );

		if ( editCount === 0 ) { return '0 edits'; }
		if ( editCount < 5 ) { return '1-4 edits'; }
		if ( editCount < 100 ) { return '5-99 edits'; }
		if ( editCount < 1000 ) { return '100-999 edits'; }
		if ( editCount >= 1000 ) { return '1000+ edits'; }

		// This is unlikely to ever happen. If so, we'll want to cast to a string
		// that is not accepted and allow EventLogging to complain
		// about invalid events so we can investigate.
		return 'error (' + editCount + ')';
	}

	/**
	 * Log data to the PageIssuesAB test schema. It's safe to call this function prior to
   * subscription.
	 * @param {Object} data to log
   * @return {void}
	 */
	function log( data ) {
		mwTrack( EVENT_PAGE_ISSUE_LOG, data );
	}

	M.define( 'skins.minerva.scripts/pageIssueLogger', {
		newPageIssueSchemaData: newPageIssueSchemaData,
		subscribe: subscribe,
		log: log
	} );
}( mw.mobileFrontend, mw.config, mw.now, mw.track, mw.trackSubscribe, mw.user ) );