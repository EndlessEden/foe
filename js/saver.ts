import * as $ from 'jquery';
import * as LZString from 'lz-string';

import { Gui } from './gui';
import { isOnline } from './gamestate';
import { Text } from './text';
import { SetGameCache, GameCache } from './GAME';
import { loadfileOverlay } from './fileoverlay';
import { CacheToGame, GameToCache } from './gamecache';
import { GenerateFile } from './utility';

export namespace Saver {
	export const slots = 12;

	export function SavePrompt(backFunc? : CallableFunction) {
		Text.Clear();

		Text.Add("Save game:");
		Text.NL();

		var options = new Array();
		for(var i=0; i<Saver.slots; i++) {
			Text.Add("Game " + i + ": ");
			var name = localStorage["save" + i];
			if(name) {
				Text.Add(name);
				options.push({ nameStr : "Game " + i,
					func : function(obj : number) {
						var prmpt = prompt("This will overwrite save slot " + obj + ", continue? \n\n Comment:");
						if(prmpt != null) SaveGame(obj, prmpt);
					}, enabled : true, obj : i
				});
			}
			else {
				Text.Add("EMPTY");
				options.push({ nameStr : "Game " + i,
					func : function(obj : number) {
						var prmpt = prompt("This will save to slot " + obj + ", continue? \n\n Comment:");
						if(prmpt != null) SaveGame(obj, prmpt);
					}, enabled : true, obj : i
				});
			}
			Text.NL();
		}
		Gui.SetButtonsFromList(options, true, backFunc);

		Text.NL();
		if (HasSaves()) {
			var storageLength = 0;
			for (var key in localStorage) {
				if (localStorage.hasOwnProperty(key) && localStorage[key].length) {
					storageLength += localStorage[key].length;
				}
			}
			Text.Add("localStorage usage: " + ((storageLength * 16) / (8 * 1024)).toFixed(2) + 'kB');
		}
		Text.Flush();
	}

	function SaveGame(slot : number, comment : string) {
		GameToCache();
		var seen : any[] = [];
		var saveData = JSON.stringify(GameCache(), function(key, value) {
			if (typeof value === "object" && value !== null) {
				if (seen.indexOf(value) !== -1) {
					console.error("Circular reference found in the gameCache!\n" + key + ":", value);
					return;
				}
				seen.push(value);
			}
			return value;
		});

		var saveName = GameCache().name;
		if (comment) {
			saveName += " :: Comment: " + comment;
		}

		localStorage["saveDataLZ" + slot] = LZString.compressToUTF16(saveData);
		localStorage["save" + slot] = saveName;
		// Clear out legacy storage.
		delete localStorage["savedata" + slot];

		Saver.SavePrompt();
	}

	export function SaveToFile() {
		var filename;
		if(GenerateFile.canSaveOffline) {
			filename = prompt("SAVE TO FILE MIGHT NOT WORK IN OFFLINE MODE!\n\n Enter name of save file.");
		}
		else {
			filename = prompt("SAVE TO FILE WILL NOT WORK IN OFFLINE MODE!\n\n Enter name of save file.");
		}
		if(filename && filename != "") {
			GameToCache();
			var seen : any[] = [];
			GenerateFile({filename: filename, content: JSON.stringify(GameCache(),
				function(key, val) {
					if (typeof val == "object") {
						if (seen.indexOf(val) >= 0)
							return;
						seen.push(val);
					}
					return val;
				})
			});
		}
		else {
			Text.NL();
			Text.Add("No file saved: Enter a filename!", null, 'bold');
			Text.Flush();
		}
	}

	// Returns true if there are any saves
	export function HasSaves() {
		if(!isOnline()) return false;
		for(var i=0; i<Saver.slots; i++)
			if(SaveHeader(i)) return true;
		return false;
	}

	export function LoadPrompt(backFunc : any) {
		Text.Clear();

		Text.Add("Load game:");
		Text.NL();

		var options = new Array();
		for(var i=0; i<Saver.slots; i++) {
			Text.Add("Game " + i + ": ");
			var name = localStorage["save" + i];
			if(name)
				Text.Add(name);
			else
				Text.Add("EMPTY");
			Text.NL();
			options.push({ nameStr : "Game " + i,
				func : LoadGame, enabled : SaveHeader(i), obj : i
			});
		}
		Gui.SetButtonsFromList(options, true, backFunc);

		Text.NL();
		if (HasSaves()) {
			var storageLength = 0;
			for (var key in localStorage) {
				if (localStorage.hasOwnProperty(key) && localStorage[key].length) {
					storageLength += localStorage[key].length;
				}
			}
			Text.Add("localStorage usage: " + ((storageLength * 16) / (8 * 1024)).toFixed(2) + 'kB');
		}
		Text.Flush();
	}

	function LoadGame(slot : number) {
		if (localStorage["saveDataLZ" + slot]) {
			var saveData = LZString.decompressFromUTF16(localStorage["saveDataLZ" + slot]);
			SetGameCache(JSON.parse(saveData));
		} else {
			// Load from legacy storage.
			SetGameCache(JSON.parse(localStorage["savedata" + slot]));
		}

		CacheToGame();
		Gui.PrintDefaultOptions();
	}

	function SaveHeader(nr : number) {
		return localStorage["save" + nr];
	}

	export function DeleteSave(nr : number) {
		delete localStorage["save" + nr];
		delete localStorage["savedata" + nr];
	}

	export function Clear() {
		//localStorage.clear();
		var conf = confirm("This will remove all local saves and settings, do you really want to continue?");
		if(conf == true) {
			for(var i=0; i<Saver.slots; i++) {
				delete localStorage["save" + i];
				delete localStorage["savedata" + i];
			}
		}
	}

	function OnLoadFromFileClick() {
		let el : any = document.getElementById('loadFileFiles');
		let files = el.files;
		if (!files.length) {
			alert('Please select a file!');
			return;
		}

		loadfileOverlay();

		var file = files[0];

		LoadFromFile(file);
	}

	// Takes a File as argument
	function LoadFromFile(file : any) {
		if(!file) return;

		var reader = new FileReader();

		reader.onload = function(e) {
			let target : any = e.target;
			SetGameCache(JSON.parse(target.result));
			CacheToGame();
			Gui.PrintDefaultOptions();
			Gui.Render();
		}

		reader.readAsText(file);
	}

	export function Init() {
		$("#loadFileOk").click(OnLoadFromFileClick);
		$("#loadFileCancel").click(loadfileOverlay);
	}

}
