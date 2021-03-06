import $ from 'webpack-zepto'
import Card from './card.js'

export default {
	props: ["stage"],
	data: function () {
		return {
			id: DDZ_UNKNOWN,
			name: "",
			cards: [],
			cardCount: 0,
			lastShot: [],
			shotCount: 0,
			speaking: false,
			isMaster: false,
			hasPrepared: false,
			callState: 0 /* +/-/0 */
		}
	},
	computed: {
		displayName: function () {
			return this.id === DDZ_UNKNOWN ? "Nobody"
				: (this.name.length ? this.name.length : "Player #" + this.id);
		},
		parsedCards: function () {
			return Card.convert(this.cards).sort(Card.cardSort);
		},
		parsedLastShot: function () {
			return Card.convert(this.lastShot).sort(Card.cardSort);
		}
	},
	methods: {
		handle: function (message) {
			this.setMaster(message);
			this.speaking = this.$parent.stage > 0 && message.speaker === this.id;
			if (message.playerId === this.id) {
				switch (message.action) {
					case "start":
						this.cards = message.cards;
						break;
					case "call":
						this.callState = message.confirmed ? 1 : -1;
						break;
					case "shoot":
						this.shotCount++;
						this.lastShot = message.data.cards;
						if (this.lastShot.length) {
							this.$parent.setLastPlayerId(message.playerId);
							this.$parent.lastPlayerShot = message.data.cards;
							this.cardCount -= this.lastShot.length;
							this.cards = this.cards.filter(function (v) {
								return message.data.cards.indexOf(v) === -1;
							});
						}
						break;
				}
			}
		},
		join: function (id, prepared) {
			this.id = id >> 0;
			this.speaking = !prepared;
			this.hasPrepared = prepared;
		},
		reset: function () {
			this.callState = 0;
			this.isMaster = false;
			this.cards = [];
			this.cardCount = 0;
			this.lastShot = [];
			this.shotCount = 0;
		},
		leave: function () {
			this.join(DDZ_UNKNOWN, false);
		},
		setMaster: function (message) {
			if (message.action === "play") {
				this.isMaster = this.id === message.speaker;
				this.cardCount = this.isMaster ? 20 : 17;
				this.cards = this.isMaster ? this.cards.concat(message.data.coverCards) : this.cards;
			}
		}
	}
}