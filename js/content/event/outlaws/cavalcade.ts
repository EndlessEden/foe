import { Cavalcade } from "../../../engine/cavalcade/cavalcade";
import { ICavalcadePlayer } from "../../../engine/cavalcade/cavalcade-player";
import { Entity } from "../../../engine/entity/entity";
import { GAME, TimeStep, WorldTime } from "../../../engine/GAME";
import { GameState, SetGameState } from "../../../engine/gamestate";
import { IChoice } from "../../../engine/navigation/link";
import { Party } from "../../../engine/navigation/party";
import { IParse, Text } from "../../../engine/parser/text";
import { Gui } from "../../../gui/gui";

export namespace OCavalcadeScenes {
	export function Bet() {
		return 10; // TODO
	}
	export function Enabled() {
		return WorldTime().hour < 4 || WorldTime().hour >= 14;
	}

	export function PrepRandomCoinGame() {
		const player: ICavalcadePlayer = GAME().player;
		const party: Party = GAME().party;

		const onEnd = () => {
			const parse: IParse = {
				playername : player.name,
			};

			SetGameState(GameState.Event, Gui);

			TimeStep({minute: 5});

			Text.NL();
			if (OCavalcadeScenes.Enabled()) {
				Text.Add("<i>“Do you want to go for another game, [playername]?”</i>", parse);
				Text.Flush();

				// [Sure][Nah]
				const options: IChoice[] = [];
				options.push({ nameStr : "Sure",
					func() {
						Text.NL();
						OCavalcadeScenes.PrepRandomCoinGame();
					}, enabled : party.coin >= OCavalcadeScenes.Bet(),
					tooltip : "Deal another round!",
				});
				options.push({ nameStr : "Nah",
					func() {
						Text.Clear();
						Text.Add("<i>“Alright, see you around!”</i> You leave the group, another outlaw soon taking your place.", parse);
						Text.Flush();

						Gui.NextPrompt();
					}, enabled : true,
					tooltip : "Nah, this is enough Cavalcade for now.",
				});
				Gui.SetButtonsFromList(options, false, undefined);
			} else {
				Text.Add("<i>“It’s getting late, how about we break this up?”</i> the lizan yawns, gathering up the cards. <i>“If you want another game later, just holler.”</i>", parse);
				Text.Flush();

				Gui.NextPrompt();
			}
		};

		player.purse  = party;
		const players = [player];

		for (let i = 0; i < 3; i++) {
			const ent: any = new Entity();

			ent.name = "Outlaw";
			ent.purse = { coin: 100 };
			if (Math.random() < 0.5) {
				ent.body.DefMale();
			} else {
				ent.body.DefFemale();
			}

			players.push(ent);
		}

		const g = new Cavalcade(players, {bet    : OCavalcadeScenes.Bet(),
										onPost : onEnd});
		g.PrepGame();
		g.NextRound();
	}
}
