<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */
namespace MediaWiki\Minerva\Menu\User;

use Hooks;
use MediaWiki\Minerva\Menu\Definitions;
use MediaWiki\Minerva\Menu\Entries\ProfileMenuEntry;
use MediaWiki\Minerva\Menu\Entries\SingleMenuEntry;
use MediaWiki\Minerva\Menu\Group;
use MessageLocalizer;
use User;

/**
 * Logged-in, advanced Mobile Contributions user menu config generator.
 */
final class AdvancedUserMenuBuilder implements IUserMenuBuilder {
	/**
	 * @var MessageLocalizer
	 */
	private $messageLocalizer;

	/**
	 * @var User
	 */
	private $user;

	/**
	 * @var Definitions
	 */
	private $definitions;

	/**
	 * @param MessageLocalizer $messageLocalizer
	 * @param User $user
	 * @param Definitions $definitions A menu items definitions set
	 */
	public function __construct(
		MessageLocalizer $messageLocalizer, User $user, Definitions $definitions
	) {
		$this->messageLocalizer = $messageLocalizer;
		$this->user = $user;
		$this->definitions = $definitions;
	}

	/**
	 * @inheritDoc
	 * @param array $personalTools list of personal tools generated by
	 * SkinTemplate::getPersonalTools
	 * @return Group
	 */
	public function getGroup( array $personalTools ): Group {
		$group = new Group();
		$group->insertEntry( new ProfileMenuEntry( $this->user ) );
		$group->insertEntry( new SingleMenuEntry(
			'userTalk',
			$this->messageLocalizer->msg( 'mobile-frontend-user-page-talk' )->escaped(),
			$this->user->getUserPage()->getTalkPage()->getLocalURL(),
			true,
			null,
			'before',
			'wikimedia-ui-userTalk-base20'
		) );
		$sandbox = $personalTools['sandbox']['links'][0] ?? false;

		if ( $sandbox ) {
			$group->insertEntry( new SingleMenuEntry(
				'userSandbox',
				$sandbox['text'],
				$sandbox['href']
			) );
		}
		$this->definitions->insertWatchlistMenuItem( $group );
		$this->definitions->insertContributionsMenuItem( $group );
		if ( $this->user->isAnon() ) {
			$this->definitions->insertLogInMenuItem( $group );
		} else {
			$this->definitions->insertLogOutMenuItem( $group );
		}
		Hooks::run( 'MobileMenu', [ 'user', &$group ] );
		return $group;
	}
}