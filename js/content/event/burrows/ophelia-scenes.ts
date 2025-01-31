import { Encounter } from "../../../engine/combat/combat";
import { CumLevel } from "../../../engine/entity/body/balls";
import { BodyPartType } from "../../../engine/entity/body/bodypart";
import { Cock } from "../../../engine/entity/body/cock";
import { Gender } from "../../../engine/entity/body/gender";
import { Sex } from "../../../engine/entity/entity-sex";
import { Perks } from "../../../engine/entity/perks";
import { PregnancyHandler } from "../../../engine/entity/pregnancy";
import { GAME, TimeStep, WORLD } from "../../../engine/GAME";
import { AlchemyItems } from "../../../engine/inventory/items/alchemy";
import { QuestItems } from "../../../engine/inventory/items/quest";
import { EncounterTable } from "../../../engine/navigation/encountertable";
import { IChoice } from "../../../engine/navigation/link";
import { Party } from "../../../engine/navigation/party";
import { GP } from "../../../engine/parser/parser";
import { Text } from "../../../engine/parser/text";
import { Gui } from "../../../gui/gui";
import { SetGameOverButton } from "../../../main-gameover";
import { Lagomorph, LagomorphAlpha } from "../../enemy/rabbit";
import { Burrows } from "../../loc/eden/plains/burrows";
import { BurrowsFlags } from "../../loc/eden/plains/burrows-flags";
import { Roa } from "../brothel/roa";
import { RoaFlags } from "../brothel/roa-flags";
import { GlobalScenes } from "../global";
import { Kiakai } from "../kiakai";
import { Rosalin } from "../nomads/rosalin";
import { Player } from "../player";
import { Miranda } from "../rigard/miranda";
import { Terry } from "../terry";
import { Lagon, LagonRegular } from "./lagon";
import { LagonScenes } from "./lagon-scenes";
import { Ophelia } from "./ophelia";
import { OpheliaFlags } from "./ophelia-flags";
import { Vena } from "./vena";
import { VenaFlags } from "./vena-flags";
import { VenaScenes } from "./vena-scenes";

export namespace OpheliaScenes {
    let WatchedOphelia: boolean;
    let rewardSexFlag: boolean;
    let fuckedByVena: boolean;
    let stoppedVena: boolean;

    export function LabDesc() {
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        const old = ophelia.flags.Met !== 0 ? ` old` : ``;
        const camp = GlobalScenes.PortalsOpen() ? `the gemstead` : `camp`;

        Text.Out(`You are standing in Ophelia’s${old} makeshift laboratory, which is cast in bright light with a strangely greenish hue. Scrolls and books are stacked on narrow shelves alongside earthenware pots containing who-knows-what and odd mixtures boiling in large glass flasks. Grime and smoke have added a permanent patina of grease to everything in the room, which speaks to you of the wisdom of having an alchemical lab without a proper air vent. A handful of lapine guinea-pigs are shackled to one wall, either waiting for new experiments or under observation.`);
        Text.NL();
        if (ophelia.Recruited()) {
            if (ophelia.InParty()) {
                if (ophelia.Broken()) {
                    Text.Out(`“My old lab!” Ophelia pipes up happily, “I want… want…” the lagomorph stretches a trembling paw toward one of the flasks, perhaps eager to see what effects it would have on her body. Before she can make a grab for it, her replacement slaps the hand down, fussing to you about keeping Ophelia in check.

                    “Sister no longer good for this kind of work,” the rabbit tells you, urging you to leave.`);
                } else {
                    Text.Out(`“My old lab!” Ophelia hums fondly. She spends the time chatting with her replacement while you look around.`);
                }
            } else {
                if (ophelia.Broken()) {
                    Text.Out(`The lab is run by one of the brainy lagomorphs after Ophelia’s downfall. You wonder what she’s up to now, back in ${camp}. Perhaps you should pay your lapine slut a visit.`);
                } else {
                    Text.Out(`Ophelia’s replacement is busy with some experiment, but takes the time to inquire how her sister is faring in your care. You assure her that there is nothing to worry about.`);
                }
            }
        } else {
            if (ophelia.Broken()) {
                Text.Out(`The lab is run by one of the brainy lagomorphs after Ophelia’s downfall. These days, the former alchemist spends all her time in the Pit with her mother; a dutiful breeding slut to Lagon.`);
            } else if (ophelia.IsAtLocation()) {
                Text.Out(`Ophelia is at her workbench, working on a new experiment of some sort.`);
            } else {
                Text.Out(`You don’t see the owner of the lab anywhere, though signs of relatively recent activity tell you she probably isn’t very far away. Perhaps she has gone to sleep${burrows.VenaRestored() ? `, or to speak with her mother.` : burrows.LagonDefeated() ? `.` : `, or to speak with her father.`}`);
            }
        }
        Text.NL();
    }

    export function LabApproach() {
        const player: Player = GAME().player;
        const pc = player.Parser;

        Text.Clear();
        Text.Out(`“So much to do.” Ophelia fusses as she scurries about, snatching herbs and bottles from the overladen shelves. “Did you have something for me, ${pc.name}?”`);
        Text.Flush();

        OpheliaScenes.LabPrompt();
    }

    export function TraitPrompt(options: IChoice[]) {
        const burrows: Burrows = GAME().burrows;

        if (burrows.flags.BruteTrait === BurrowsFlags.TraitFlags.Inactive) {
            options.push({ nameStr : `Cactoid`,
                func() {
                    Text.Clear();
                    Text.Out(`“The cactoids should be fairly easy to catch, if you find them. The problem is the environment they live in. I’ve heard the desert is harsh.” Ophelia goes on to describe the critter in greater detail. “Look for small turtle-like creatures. They have needles on their backs, so be careful.”

                    “I’m going to need three of them to complete my experiments.”`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the cactoids.`,
            });
        } else if (burrows.flags.BruteTrait === BurrowsFlags.TraitFlags.Gathered) {
            options.push({ nameStr : `Cactoid`,
                func : OpheliaScenes.DeliverCactoids, enabled : true,
                tooltip : `Deliver the cactoids.`,
            });
        } else { // turned in
            options.push({ nameStr : `Brawny trait`,
                func() {
                    Text.Clear();
                    Text.Out(`“I… I’m not certain that it was a good idea to introduce this strain.” Ophelia looks troubled. “The specimens show great strength, and are considerably larger than the usual offspring, large enough to easily overpower regular men. It comes at a price however.”

                    “The brutes have even less control of their natural urges than my other brothers and sisters… they are almost like feral beasts.”`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the brawny trait.`,
            });
        }
        if (burrows.flags.HermTrait === BurrowsFlags.TraitFlags.Inactive) {
            options.push({ nameStr : `Gol husk`,
                func() {
                    Text.Clear();
                    Text.Out(`“The Gol are large feral insects, quite dangerous if you are caught unawares. In fact, you should probably run if you come across a live one,” Ophelia cautions you. “Trust me, you’ll know it when you see it - they are larger than horses.” She shows you a picture of a husk from one of her books, so you know what to look for.

                    “The Gol usually keep to the deep forest, but they occasionally stray near the outskirts. I’m going to need three pieces of husk in order to finish my experiments. Just make sure you take them from dead Gols, or find parts that have been shed in their growth process.”`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the Gol husks.`,
            });
        } else if (burrows.flags.HermTrait === BurrowsFlags.TraitFlags.Gathered) {
            options.push({ nameStr : `Gol husk`,
                func : OpheliaScenes.DeliverGolHusks, enabled : true,
                tooltip : `Deliver the Gol husks.`,
            });
        } else { // turned in
            options.push({ nameStr : `Herm trait`,
                func() {
                    Text.Clear();
                    Text.Out(`“This one was certainly interesting. I think I might even consider it myself...” Ophelia trails off thoughtfully. “All the males seem to enjoy their cocks so much, I wonder what it would feel like...”

                    You can’t seem to get anything more coherent out of her on the topic at the moment.`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the herm trait.`,
            });
        }
        if (burrows.flags.BrainyTrait === BurrowsFlags.TraitFlags.Inactive) {
            options.push({ nameStr : `Algae`,
                func() {
                    Text.Clear();
                    Text.Out(`“The algae should be the easiest ones, since you can find them at the shores of the lake. They should look something like this.” She shows you a scroll, depicting an odd aquatic plant. “Just make sure to get the red ones. The yellow ones are apparently lethal to the touch. I think that is what the scroll says anyways, the writer is a bit unclear about it.”

                    “I’ll need three samples.”`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the red algae.`,
            });
        } else if (burrows.flags.BrainyTrait === BurrowsFlags.TraitFlags.Gathered) {
            options.push({ nameStr : `Algae`,
                func : OpheliaScenes.DeliverAlgae, enabled : true,
                tooltip : `Deliver the red algae.`,
            });
        } else { // turned in
            options.push({ nameStr : `Brainy trait`,
                func() {
                    Text.Clear();
                    Text.Out(`“I had hoped that this one would help mother, but it seems my alchemy wasn’t strong enough.” Ophelia shrugs dejectedly. “At the very least, I can have some slightly more stimulating conversations with my brothers and sisters now.”`);
                    Text.Flush();
                    OpheliaScenes.LabPrompt();
                }, enabled : true,
                tooltip : `Ask Ophelia about the brainy trait.`,
            });
        }
    }

    // TODO
    export function TalkPrompt() {
        const player: Player = GAME().player;
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;
        const pc = player.Parser;

        // [Herself] [Her lab] [Sex] [Vena] [Lagon]
        const options: IChoice[] = [];
        options.push({ nameStr : `Herself`,
            func() {
                Text.Clear();
                if (ophelia.flags.Talk & OpheliaFlags.Talk.Herself) {
                    Text.Out(`“Again?”

                    Yes, please, you’d like to hear it again.

                    “If you insist,” she says with a soft smile.`);
                } else {
                    Text.Out(`“Me? I’m not really that interesting,”she says nonchalantly.

                    Smiling, you assure her that you still want to hear something about her past. Everyone has a story to tell, and you’d love if she’d share hers with you.

                    “Alright, then. If you really wish to know,” she smiles softly.`);
                }
                Text.NL();
                Text.Out(`“I’m not really that special. I was born when my mother, Vena, still had her full faculties. Mother was always caring and loving while father was… less so. Still, me and my siblings, we were treated well and I was happy.”

                It sounds like a happy time, you note. Was her family anywhere near as large as it is now back then, or was it smaller when she was young?

                “It was much smaller. I mean… sex was nothing new. Both father and mother would enjoy themselves with my older siblings, but it was nothing like what you would see in the pits. I remember that I’d always looked forward to the day I would join them.”

                There’s a fond, wistful smile on the lagomorph’s face as she says this. You are starkly reminded of just how alien a life she’s led, but there’s something about her particular choice of words that’s catching your attention.

                Rolling the thought around in your head, you comment that Ophelia describes her anticipation in the past tense. Did something happen, on her first time with her parents? Was it not as good as she’d hoped it would be?`);
                Text.NL();
                if (ophelia.Relation() < 30) {
                    Text.Out(`“Nothing really happened. Losing my virginity hurt at first, but I expect it was the same for every sister of mine.”

                    Ophelia’s tone is steady and even, but her body language betrays her. The tension in her shoulders, the slightly haunted look in her eyes. Clearly, there’s more to this than she’s letting on.

                    Still, you decide to drop the topic, simply nodding in feigned acceptance. She’s clearly being evasive because she doesn’t trust you with the whole truth. Maybe if she knew you better, she’d be comfortable with telling you the real details.`);
                } else {
                    Text.Out(`“...No, it was nothing like I expected,” she says, looking downcast.

                    The lapin alchemist looks so sad and vulnerable that a twinge of sympathy forces itself through your heart. Gently, you ask if she can tell you what she expected - and what she actually got.

                    “I didn’t expect much, really. My sisters spoke to me about what it was like, so I kinda knew what to expect, mom also helped. But my first time was with father, and he was not gentle.”

                    Remembering your own meetings with the${burrows.LagonDefeated() ? ` former` : ``} king of the burrows, you can imagine that. Tenderly, you indicate Ophelia should continue.

                    “It hurt. It also felt somewhat good, father is pretty big… but it still hurt. I had my first orgasm, felt him fill me for the first time, then he discarded me and went to my sister. He didn’t say a word, didn’t look back, he just dropped me and moved on.”

                    Another pang of sympathy pierces you, stronger than the one before. You can just see it in your mind’s eye: a young, baffled Ophelia, nethers dripping her father’s seed, watching in pained confusion as her sire discards her like a used condom to fuck a fresh hole.

                    “I was pretty sore and couldn’t get up at all. Roa, my brother, was the one who helped me. He cleaned me up, made me feel better. He’s always been nice to me...”

                    Despite everything, a slight smile crosses your lips upon hearing that. Roa truly does sound like he was a good brother to Ophelia.

                    “Mother was pretty mad at father after that. She scolded him and made him apologize to me. It made me feel a lot better,” she adds, smiling softly.

                    She clears her throat, recomposing herself. “After that, I had other experiences with my brothers, and even my sisters. I learned a lot, and had a good time. I also had a few turns with father after that. He was at least a little gentler the following times, but I didn’t, and still don’t enjoy having sex with him that much.”

                    Well, you can hardly blame her for that, even if her reasonings are a little off compared to why most people wouldn’t enjoy screwing their dad. No wonder she spends so much time cooped up in her lab; best way to avoid getting noticed by him, after all.`);
                }
                Text.NL();
                Text.Out(`With a sagacious nod, you thank Ophelia for sharing her story. It’s always interesting to find out more about the people you meet.

                “Sure, anytime.”`);
                Text.Flush();

                ophelia.relation.IncreaseStat(20, 1);

                ophelia.flags.Talk |= OpheliaFlags.Talk.Herself;

                OpheliaScenes.TalkPrompt();
            }, enabled : true,
            tooltip : `You’d like to know a little more about Ophelia.`,
        });
        options.push({ nameStr : `Her Lab`,
            func() {
                Text.Clear();
                Text.Out(`“We sometimes steal things from passing merchants or wanderers. One time, after a successful picking, we got a few books on alchemy. I got interested, and started researching the subject.”

                That makes sense. It’s quite obvious that Lagon and his brood have been thieving for who knows how long, and Ophelia always did strike you as somewhat of a bookworm - if only in comparison to her brothers and sisters. Nodding absently, you ask if Ophelia remembers the first potion she tried to brew.

                “Yes, I do actually. My knowledge is somewhat limited, so whatever I learn, I usually do through experimentation. I try many things, but I’m not always successful. A while ago, I tried to experiment with a feminizing potion on one of my brothers, but all it did was give him budding breasts. He was quite happy with them though.”

                Well, that makes sense, from what you’ve seen of her siblings. So, does she rely on trial-and-error exclusively, then?

                “We usually look for more alchemy books whenever we can, but they’re hard to come by, so experimentation is the only real way I can make some progress. These days, I have many volunteers, but it wasn’t always like this. Most of my brothers and sisters are more worried with sex than helping me with new discoveries. Father had to intervene because of it. He’s always had a keen interest in my alchemy.”

                Recalling the very first task Lagon set for you upon your being brought here, you just bet he has. Being diplomatic, you ask if that means Ophelia never had to prove herself as an alchemist to her father. He never challenged her to produce a specific potion before he promoted her to the ‘royal alchemist’, so to speak?`);
                Text.NL();
                if (ophelia.Relation() < 30) {
                    Text.Out(`“Not really, he just pushes me to make more,” she says, with a hint of hesitation.

                    Hmm... interesting. You have a feeling there’s more to it than that, but you don’t think she’ll explain it better unless she trusts you more.`);
                } else {
                    Text.Out(`“That’s… difficult to answer. Father doesn’t ask for specific potions but he constantly pressures me. It’s like… if I don’t produce something useful, I’m scared what he might do to me...”

                    That... sounds just like Lagon. You have no doubts in the slightest that he would turn on even Ophelia if she stopped being useful to him. You hold your tongue, though; no point in scaring her with that fact.`);
                }
                Text.NL();
                Text.Out(`“Well, that’s most of the story. This lab, I built with the help of my brothers and sisters, using whatever we managed to scavenge. And then you showed up to help me.”

                Seeing the smile on Ophelia’s face makes you smile in turn. You assure her that it was nothing, and thank her for telling you this.`);
                Text.Flush();

                ophelia.relation.IncreaseStat(20, 1);
                OpheliaScenes.TalkPrompt();
            }, enabled : true,
            tooltip : `So, how did Ophelia start working with alchemy anyway?`,
        });
        options.push({ nameStr : `Sex`,
            func() {
                Text.Clear();
                if (ophelia.flags.Talk & OpheliaFlags.Talk.Sex) {
                    Text.Out(`“I love sex. You should know. You’ve had me.”

                    You smile at her and apologize. You simply thought it would be a nice little icebreaker; a girl like her deserves a little more finesse than just ‘hey, wanna fuck?’

                    “Oh...” She smiles. “Thanks. Now that the ice is broken, what are you going to do?”

                    Well, if she’s in the mood, you’re sure you have something new to teach her...

                    “Of course. I’m always in the mood for a little more... research.” She smiles.`);
                    ophelia.relation.IncreaseStat(30, 1);
                } else {
                    Text.Out(`“I love sex. There’s nothing quite like a big, gentle partner who knows exactly what you like,” she says, closing her eyes and smiling at the mental picture she conjures for herself.

                    Really? You always thought that she seemed... well, if you’re honest, less obsessed with sex than her siblings. So, she enjoys a nice romp between the sheets too?

                    “Maybe I am less obsessed, but that doesn’t mean I don’t enjoy it just as much. It’s just that I can’t contain my curiosity. I love discovering new things.”

                    The hook is just too obvious for you to ignore. A knowing grin crosses your lips as you quip that she must surely like discovering new things for the bedroom best of all.

                    Ophelia smiles knowingly, nodding in confirmation of your suspicions. “Yes, it’s actually the reason I got so interested in alchemy. Ever since my first experiment, I’ve been trying to find new mixtures to spice things up. I usually test my volunteers myself.”

                    You nod slowly, rubbing your chin as a thought takes hold. So... does she always leave her ‘learning’ for after her alchemy experiments? Or is she willing to learn something new without that sort of ‘foreplay’ first?

                    The lapin alchemist looks at you in curiosity. “Umm, why? What do you have in mind?”

                    Well, you were wondering if she might be interested in seeing if you can teach her something new or not...

                    “Well...” She taps her chin in thought. “I’ve only experimented with my siblings, and I’d be lying if I said I don’t wonder what it’d be like to have sex with someone from outside the colony, so I think I’m up for a little research on the subject,” she concludes, smiling flirtatiously at you.

                    In that case, you’re happy to oblige her.`);
                    ophelia.relation.IncreaseStat(100, 3);
                }
                Text.Flush();

                OpheliaScenes.SexEntryPoint();
            }, enabled : true,
            tooltip : `Ophelia’s... different... to the other bunnies in the warren. What does she think of sex?`,
        });
        options.push({ nameStr : `Vena`,
            func() {
                Text.Clear();
                if (burrows.VenaRestored()) {
                    Text.Out(`“If you want to know more about her, you should consider asking her yourself. Mom is a lot more approachable than father.” Ophelia reminds you, a slight grin on her face. “But I have no problem talking to you about her. What exactly did you have in mind?”`);
                    Text.NL();
                    OpheliaScenes.TalkVena();
                } else {
                    if (burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage3) {
                        Text.Out(`“Speaking of which, have you had any luck tracking down the scepter?”`);
                        Text.Flush();

                        // [Yes] [No]
                        const options: IChoice[] = [];
                        options.push({ nameStr : `Yes`,
                            func() {
                                OpheliaScenes.TurnInScepter();
                            }, enabled : GAME().party.Inv().QueryNum(QuestItems.Scepter),
                            tooltip : `Show her the scepter.`,
                        });
                        options.push({ nameStr : `No`,
                            func() {
                                Text.Clear();
                                Text.Out(`With a shake of your head, you inform her that you haven’t managed to find it yet. You do promise that you’ll let her know as soon as you do have it.`);
                                Text.NL();
                                OpheliaScenes.TalkVena();
                            }, enabled : true,
                            tooltip : `You don’t have the scepter yet.`,
                        });
                        Gui.SetButtonsFromList(options, false, undefined);
                    } else {
                        Text.Out(`“I wish I knew of a way to restore her, then you could ask her yourself... but right now? At most, she’ll have the brains to ask for sex...” Ophelia says with a sad face and drooping ears.`);
                        Text.NL();
                        OpheliaScenes.TalkVena();
                    }
                }
            }, enabled : true,
            tooltip : `If she’s okay with it, you’d like to know more about her mom.`,
        });
        options.push({ nameStr : `Lagon`,
            func() {
                Text.Clear();
                if (burrows.LagonDefeated()) {
                    Text.Out(`“Thank you so much for stopping him,” Ophelia says with a grin. “I still can’t believe you beat him.”

                    You assure Ophelia that it was the least you could do. Lagon needed to be stopped, and so you did it.

                    “I know, I just can’t believe you actually did it,” she smiles. “Father was so powerful, and he even had my potion. You must be some kind of hero to have accomplished this.”`);
                    Text.Flush();

                    const options: IChoice[] = [];
                    options.push({ nameStr : `Be modest`,
                        func() {
                            Text.Clear();
                            Text.Out(`She merely shakes her head. “No, believe me, I’m not. Even if there are some of us who don’t seem to care, the truth is that you’ve done a great service for the colony.”

                            With a sheepish smile, you insist that you were just doing what anyone would have done - indeed, should have done - when faced with Lagon’s cruel tyranny.`);
                            Gui.PrintDefaultOptions();
                        }, enabled : true,
                        tooltip : `Ophelia is giving you far too much credit.`,
                    });
                    options.push({ nameStr : `Boast`,
                        func() {
                            Text.Clear();
                            Text.Out(`Thrusting out your chin, you fold your arms over your chest and give a triumphant grin. With a firm tone, you praise Ophelia for her attentiveness; it’s good to see she, at least, appreciates your efforts in rescuing her and her siblings from Lagon.

                            “It’s not just me. I know my brothers and sister seem like they don’t care much for what you did, but some of them do. You truly are a hero, ${pc.name}.”`);
                            Gui.PrintDefaultOptions();
                        }, enabled : true,
                        tooltip : `Of course you’re a hero, so why not accept the praise that is your due?`,
                    });
                    Gui.Callstack.push(() => {
                        Text.NL();
                        if (burrows.VenaRestored()) {
                            Text.Out(`“Defeating father was a huge step, but restoring my mother… I don’t think there’ll ever be a way for me to repay you for all you did for us.”

                            You’re just happy that the burrows will be making a change for the better, with Lagon out of the picture and a much better ruler taking his place. Of course, that it gave her back her mother is also important, too.`);
                        } else {
                            Text.Out(`“Now that father has been defeated, all that’s left is for us to restore mother. She’s the only one fit to lead this colony, and I’m confident she’ll be a better ruler than my tyrannical father.”

                            You nod to show that you understand, promising that you’ll keep an eye out for the scepter in your travels so that Vena can be restored.`);
                        }
                        Text.Flush();

                        ophelia.relation.IncreaseStat(50, 1);
                        OpheliaScenes.TalkPrompt();
                    });
                    Gui.SetButtonsFromList(options, false, undefined);
                } else if (ophelia.Relation() >= 30) {
                    Text.Out(`“My father...” she starts, looking around, then she takes a deep breath to steel herself. “He’s a tyrant.”

                    That’s a... surprisingly harsh assessment.

                    “You met him. He doesn’t care about his daughters and sons. All he cares about is power. Power and breeding. He’ll stop at nothing to get what he wants. Just look what he’s done to mother!”

                    You never said it wasn’t an accurate assessment. It doesn’t quite look like Ophelia’s listening to you, though. It seems the lapin is building up to quite a passionate tirade.

                    “He keeps me around because he still thinks I’m useful. That’s the only reason I haven’t been turned into a dumb slut and thrown into the Pit to birth more soldiers for his army. I live in constant fear that he will just decide on a whim that I’m not longer worth anything anymore and discard me,” she continues, tears welling up in her eyes.

                    Without thinking about it, you reach out and place a hand on her shoulder, offering what little comfort you possibly can in the face of such ugly truths. For a moment, you consider offering to help her escape this awful place - to take her somewhere that she’ll be safe from Lagon.`);
                    Text.Flush();

                    // [Come with me] [Stay silent]
                    const options: IChoice[] = [];
                    options.push({ nameStr : `Come with me`,
                        func() {
                            Text.Clear();
                            Text.Out(`There’s a moment of hesitation as the lapin alchemist considers your invitation, but she takes your hand and pushes it off her shoulders. “I’m sorry, ${pc.name}. I’m so sorry, but I can’t leave my mother here to suffer while I run, and that is assuming we could even run in the first place. If we tried, my father would surely hunt us down, and he would find us. It’s… it’s just too dangerous. I’m sorry,” she says in resignation.

                            She has nothing to apologize for; you just felt you had to make the offer.

                            “For what it’s worth, I do appreciate the invitation,” she smiles weakly.

                            If she ever changes her mind, you’ll leave it open for her.`);
                            Text.Flush();
                            ophelia.relation.IncreaseStat(50, 2);
                            OpheliaScenes.TalkPrompt();
                        }, enabled : true,
                        tooltip : `Invite Ophelia to leave the burrows and join you in your travels.`,
                    });
                    options.push({ nameStr : `Stay silent`,
                        func() {
                            Text.Clear();
                            Text.Out(`“I’m sorry. I’m fine now,” she says, rubbing her eyes and brushing your hand off her shoulder. “Thank you.”
                            It was nothing, you assure her.`);
                            Text.Flush();
                            ophelia.relation.IncreaseStat(40, 1);
                            OpheliaScenes.TalkPrompt();
                        }, enabled : true,
                        tooltip : `Just keep your mouth shut and let Ophelia regain control.`,
                    });
                    Gui.SetButtonsFromList(options, false, undefined);
                } else {
                    Text.Out(`“My father?” she repeats hesitantly. “He’s our king, our leader...”

                    You interrupt, telling her that you know all that already, but you want to know what she thinks of him as a person - as her father. She’s his daughter, after all...

                    “I... think he’s a wonderful leader,” she says, forcing a smile. “There’s no one else I’d rather have rule us.”

                    She doesn’t sound very convinced of what she’s saying... what’s wrong?

                    “Yes, of course. Now if you’re done questioning me, I have to get back to my research,” she says, turning and going back to what she was doing.

                    ...Okay, that’s definitely <b>not</b> something she’s comfortable talking about. It’s clear that this isn’t something she’s willing to talk about, at least, not without more trust in you.

                    Deciding to leave before you outright offend her, you say your goodbyes to her stubbornly turned back and withdraw.`);
                    Text.Flush();
                    Gui.NextPrompt();
                }
            }, enabled : true,
            tooltip : `Can she tell you anything about her father?`,
        });

        if (burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage3) {
            options.push({ nameStr : `Roa`,
                func() {
                    OpheliaScenes.TalkRoa();
                }, enabled : true,
                tooltip : burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage4 ? `Talk to Ophelia about Roa.` : `Ask Ophelia for clues on Roa’s whereabouts.`,
            });
        }
        Gui.SetButtonsFromList(options, true, OpheliaScenes.LabPrompt);
    }

    export function TalkRoa() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const roa: Roa = GAME().roa;
        const ophelia: Ophelia = GAME().ophelia;
        const rosalin: Rosalin = GAME().rosalin;
        const burrows: Burrows = GAME().burrows;

        Text.Clear();
        if (burrows.flags.Access < BurrowsFlags.AccessFlags.Stage4) {
            Text.Out(`“My little brother is not a well-versed adventurer like you. I fear he may have fallen prey to some horrible monster, perhaps a bloodthirsty fox, or even a ferret...” The alchemist shudders. “If he made it, he is hiding somewhere that my father’s soldiers cannot enter, like the big city or the deep forest.”

            “I wonder where he is… He could never stand being away from the breeding pit for long. I hope that he has found some nice friends to breed with.” She sighs dejectedly.

            Sounds like the most likely place to find the estranged rabbit would be a whorehouse. Or the belly of some monster.`);
            Text.Flush();
            OpheliaScenes.TalkPrompt();
        } else {
            const first = !(ophelia.flags.Talk & OpheliaFlags.Talk.Roa);
            ophelia.flags.Talk |= OpheliaFlags.Talk.Roa;
            if (first) {
                Text.Out(`“You’ve found my brother? It’s great to know he’s safe. Tell me, how is he?” she asks enthusiastically, grasping your arm.

                Roa’s just fine, you assure her. You explain that he’s found himself the perfect safe haven for a bunny like him; he’s a whore at the Shadow Lady brothel in Rigard.

                “I see, but if you don’t mind me asking, what’s a brothel? And what’s a whore?”

                Oh, yes, you had forgotten that Ophelia doesn’t really know anything about society beyond her burrows. She speaks so eloquently compared to her siblings that you tend to assume she knows more than she does.

                After a few moments thought, you explain to Ophelia that a whore is someone who offers sex to people in exchange for them paying him or her back in various ways. And that a brothel is a place where whores live and wait for people to come and have sex with them.

                You know this is a rather drastic simplification, but it probably isn’t a good idea to bring up the whole monetary system thing. That would just complicate matters more.

                parse.l = ;
                “That sounds like a nice job for a rabbit, and I would love to visit a brothel sometime${burrows.LagonDefeated() ? `` : `, if father allows`},” Ophelia muses, her eyes distant as she tries to picture what it would be like. “Brother Roa must be happy then. He could never stay away from the Pit for long, even before I experimented on him.”

                It’s the sort of job that rabbits have an affinity for, you agree. You have little doubt she’d enjoy a visit, too. What’s this about her experimenting on Roa, anyway? Did she try out some sort of libido booster on him or something?`);
            } else {
                Text.Out(`“I think you’re better off talking to him directly, but I can share a thing or two if you want. What do you want to hear about?”

                You’d like her to tell you about her and Roa’s childhood together, and about the experiments she performed on him.

                “Well, if you want to hear about that again...”`);
            }
            Text.NL();
            Text.Out(`Ophelia walks over to her workbench, sifting through her things. Finally, she pulls out a bundle of parchment filled with messily scribbled notes. It looks rather old.

            “Brother was the first who volunteered to work with me,” she explains, wistfully flipping through the pages. “I couldn’t write as well back then, but this journal details my findings.” The alchemist taps her cheek thoughtfully. “Roa was different than my more recent subjects; perhaps it’s due to natural resistance, perhaps to the sheer amount of alchemical mixtures I poured into him, but for whatever reason, the transformations would never stick very long on him. This made him a perfect subject for repeated tests.”

            “Of course, since I was just starting out, many of my potions didn’t do very much. As I began learning more things though, I had quite a fun time thinking up new ways to play with his body.” She flashes you a naughty grin.`);
            if (first) {
                Text.NL();
                Text.Out(`Oh? Does that mean she… became intimate with him?

                “Of course! He was my favorite brother, so why not? Besides, I had to test out the changes, didn’t I?” You suppose that makes a weird kind of sense, thinking like a lagomorph.

                “Roa always spent a lot of time in the Pit - he was quite popular there too.” She cocks her head thoughtfully. “He gets enough attention at this brothel, right? He’d always get fidgety if I kept him pent up for too long.” She sighs. “I regret a little that I lacked the parts to fully give him what he wanted; he was always nice with me, but I could tell he preferred to be the one getting taken.”`);
            }
            Text.Flush();

            // [Experiments][Sex]
            const options: IChoice[] = [];
            options.push({ nameStr : `Experiments`,
                func() {
                    Text.Clear();

                    const scenes = [];

                    scenes.push(() => {
                        Text.Out(`“At first, I just mixed things together at random, just to see what I could get. A lot of my experiments didn’t do very much; some just had Roa complaining about the taste. Thankfully, he has an iron stomach.” Ophelia smiles fondly at the memory, flipping through the pages of her old journal. “We kept at it though, and I gradually started to understand the workings of alchemy, and how to decipher the recipes brought in from outside.”

                        What was her first successful experiment?`);
                        Text.NL();
                        if (ophelia.Relation() < 30) {
                            Text.Out(`“I… It was somewhat of a dare, not really something I’m proud of,” Ophelia mutters, blushing. “I’d really rather not talk about it. Suffice to say that I finally managed to get a lasting effect on Roa, though not the one I wanted. Thankfully, he reverted to his old self after a day.”`);
                        } else {
                            Text.Out(`“It… ah, how to put this,” Ophelia blushes, biting her lip. “I was a lot younger back then, and fell for the teasing of some of my stupid sisters. They were bullying me over never succeeding with my alchemy, and rather hanging out with Roa than with the cool kids - that’d be them. They teased that he was weak and girly, and wouldn’t stand a chance against <b>their</b> boyfriends.”

                            The alchemist shakes her head. “I don’t really blame them; they were just being kids and I did something stupid and selfish. Angry at them and at the world in general, I tried to mix together something that would show them; something that would make Roa big and strong, a real stud.”

                            “In short, it backfired. I lacked the proper ingredients for the recipe, so the effects were something entirely different, but it <b>did</b> work.” Finding the correct page, she reads from the journal.

                            “Roa, experiment nr.84: Studmuffin. Goal: make Larissa shut up. Prepared the ingredients according to recipe - missing cactoids, tried beetles instead. Mixture should take on a teal color, not sure what that is. I think pink is close? Fed the potion to subject, no immediate reaction. Says it tasted like strawberry. Success! Kinda. Subject is experiencing changes to body. Becoming softer and rounder - perhaps it swells up and becomes more defined later? Subject breasts swelling, hips widening. I think something has gone wrong. Subject acting strange. The others should be coming soon...” Ophelia chuckles, shaking her head as she returns the page to the binder.

                            “I’d invited Larissa and her friends over to meet ‘my new boyfriend’, and I guess they told some of my brothers too. They were going over there to pick on the nerd, but when they got there, they found me desperately trying to fend off a hyper-aroused Roa with tits the size of my head.” She smirks. “First thing that happened, he threw himself on the poor boys, who were eager to help him out with his itch. Larissa was furious.”

                            The alchemist shakes her head. “It didn’t exactly pan out the way I had planned, but I guess the end goal was achieved. Roa went back to his usual self a day later, and I apologized profusely for using him in my little plot for vengeance.”`);
                        }
                        Text.NL();
                        Text.Out(`“Anyways,” she hurries on, “once I could read the texts properly, I progressed a lot faster, and the concoctions became much... safer.”`);
                    });
                    scenes.push(() => {
                        Text.Out(`“At first, I thought that Roa’s resistance to transformations was due to my mixtures not being potent enough, but they seemed to be working just fine on my other siblings. Well, mostly fine. It’s just that whatever I fed him, it seemed to revert within a day or two.”

                        Does she know why this happened?

                        “No, I’m not quite sure. It could be something in his blood, but then again, I’ve never seen anything like it in any of our siblings, and we share the same blood.” Ophelia gestures toward the journal containing her experiments on Roa. “I had quite a few unsuccessful experiments before I got the hang of it. I’m guessing that maybe something clicked within his body with all this stuff I poured into him.” She flips through the earlier pages, squinting at her bad handwriting. “There’s no telling what might have triggered it, there’s so much stuff here, and a lot of it I didn’t even know what it was at the time.”

                        “Here, for example,” she reads from the journal: `);

                        const scenes = new EncounterTable();
                        scenes.AddEnc(() => {
                            Text.Out(`“Roa, experiment nr.23: Green stuff. Goal: test herbs found outside. Prepared plants, tried making salad. No effect on subject. Tried grinding and mixing with liquids. Result: gruel. No effect on subject, icky texture. Found strange weed with purple flowers. Subject fell asleep. Cancelling trials.”`);
                        }, 1.0, () => true);
                        scenes.AddEnc(() => {
                            Text.Out(`“Roa, experiment nr.38: ???. Goal: Bored. Found some goop in bottles behind bench. Maybe from experiment nr.12? Time changed it somehow? No effect on subject. Smells a little. Stupid Larissa came along. Cancelling trials.”`);
                        }, 1.0, () => true);
                        scenes.AddEnc(() => {
                            Text.Add(`“Roa, experiment nr.57: Liquids. Goal: test properties of semen. Notes suggest seminal fluid from some creatures have transformative elements. Might need preparation. Asked subject for help. Enthusiastic.” You peek over her shoulder, noticing a stain on the page. “Tested mixing with samples M, P and Q. No effect on subject. Tried harvesting from captured equine male. Results messy. Tested mixing with sample E and L. No effect on subject.” Further down, there is a quick scribble saying: “Subject distracted. Cancelling trials.”`);
                        }, 1.0, () => true);

                        scenes.Get();

                        Text.Out(` Ophelia shakes her head. “I have no clue what half of that stuff was.”

                        You can imagine that having a test subject that you could perform repeated experiments on without lasting effects would be very useful for an aspiring scientist.

                        “It was! Only lasting effect I ever got from him was that his fur seemed to grow steadily pinker over time… Things became more difficult after he left.” She trails off, hanging her head. `);
                        if (ophelia.Relation() < 30) {
                            Text.Out(`You wait for her to continue, but she doesn’t follow up on the thought.`);
                        } else {
                            Text.Out(`“I kind of lost my drive for a while... daddy gave me other volunteers, but it just wasn’t the same. More than a test subject, Roa was my friend.”`);
                        }
                    });
                    scenes.push(() => {
                        Text.Out(`“After a while, I developed a feel for what would work with what, and how certain ingredients could be processed and what their uses were. The texts gathered from outside were a big help, but they have large holes in their explanations; basic stuff they just assume you understand.”

                        “Once I had more confidence in my skills, I could begin to systematically research different fields, even try to develop my own mixtures based on my observations.”`);
                        if (rosalin.flags.Met !== 0) {
                            Text.Out(` It strikes you that Ophelia’s methods are similar to those of Rosalin. Well, more structured, perhaps. Certainly less fuelled by insanity. Rosalin had the advantage of an education, while the lagomorph has based her alchemy almost entirely on trial and error.`);
                        }
                        Text.NL();
                        Text.Out(`“Let’s see, let me find some examples,” the alchemist muses, flipping through her journal.`);
                        Text.NL();

                        const scenes = new EncounterTable();
                        scenes.AddEnc(() => {
                            Text.Out(`“Roa, experiment nr.213: Minotaur. Goal: study the effects of ingredients salvaged from bull-morphs. I’ve made earlier experiments focused on strengthening the body - see nr.84 (failed), nr.118, nr.162-165 - and I think that ingredients gathered from the minotaur could prove useful in this endeavor. Previous experiments suggest that hooves, horns, fur, semen and blood could be tested. Unable to find live specimen, but gatherers have brought back what seems to be a broken horn from a bull.”

                            “Ground up sample, put in marked jar. Tested mixing substance with rosemary and dried cloves. Together with a sample from experiment nr.164, the effects were increased. Subject experienced expanded muscle mass in torso and leg areas. Effect further enhanced by adding two measures of milk. Side effects: noticed growth of small horns, enlarging of the penis and testes. Further experiments put on hold until subject has calmed down.”`);
                        }, 1.0, () => true);
                        scenes.AddEnc(() => {
                            Text.Out(`“Roa, experiment nr.291: Lizan scales. Goal: study preparation of lizan scales. Previous experiments suggest that lizan scales can be used effectively in a number of ways - see nr.241-246 - but recent findings with fish scales suggest that putting them in oil and distilling the solution could prove successful.”

                            “Several samples prepared and put in different liquids. Only oil seems to have any sort of effect in extraction, but timing is extremely important. Letting it sit too long spoils the sample. Tried mixing resulting salve into previous recipes with known effects, but with no obvious success. Thought for future experiment: study effects on a different subject over a longer period of time. Perhaps use female subject.”`);
                        }, 1.0, () => true);
                        scenes.AddEnc(() => {
                            Text.Out(`“Roa, experiment nr.329: Dryad vine. Goal: study effects of plant matter. The gatherers found a real treasure today, the plant-like hair tentacle from what is presumably a dryad. Very rare ingredient! Sample seems to still be alive, have planted it in a pot. Responds positively to water, but seems to be wilting. Will try to move it outside and plant in sunlight.”

                            “Rubbing the sample gives off a thick sap, which has strong transformative properties. Mixing it with the suggested ingredients - see scroll on animated vegetation - resulted in the subject’s tongue and penis changing into long prehensile vines. Harvested more of the sap from subject for later use. Scroll also suggests that flowers blooming from the vines have interesting properties, experiments will have to wait until a larger sample has been grown.”`);
                        }, 1.0, () => true);

                        scenes.Get();

                        Text.NL();
                        Text.Out(`You note that her writing seems to get better and more descriptive over time. “Thanks, it’s a learning process,” she says, returning the page to the binder.`);
                    });
                    if (ophelia.Relation() >= 40) {
                        scenes.push(() => {
                            Text.Out(`What’s the most interesting transformation that she’s been able to get from Roa?

                            “There were some that were… fun, but worrying. If it had been another bunny, I don’t know what the long term effects would have been. Some alchemical compounds seem to affect the mind in addition to the body.” Ophelia sighs, her shoulders slumping. “Some of them, I wish I never tested.”

                            “A certain mixture will push the sexual urges of the one who takes it to the extreme; so much that all other thoughts and desires fade. The problem is that so far, I haven’t found any way to reverse the process. Roa was thankfully fine due to his resistance; I had to put him in the Pit for several days, but eventually he returned to normal.”`);
                            Text.NL();
                            if (burrows.VenaRestored()) {
                                Text.Out(`“When father fed the same potion to mother… she was not so lucky. Thankfully, you were able to find the scepter and bring her back.”

                                Is she angry at Roa for taking the scepter in the first place?

                                Ophelia shakes her head. “If he hadn’t, I don’t think I’d ever been able to get hold of it myself; father or one of his guards was always near the treasure-trove.”`);
                            } else {
                                Text.Out(`“When father fed the same potion to mother… she was not so lucky.” The alchemist hugs herself. “Sorry, could we talk about something else?”`);
                            }
                        });
                    }

                    let sceneId = ophelia.flags.rotRExp;
                    if (sceneId >= scenes.length) { sceneId = 0; }

                    ophelia.flags.rotRExp = sceneId + 1;

                    // Play scene
                    scenes[sceneId]();

                    Text.NL();
                    Text.Out(`You thank her for her story.`);
                    Text.Flush();
                    OpheliaScenes.TalkPrompt();
                }, enabled : true,
                tooltip : `Ask about the experiments that she performed on Roa.`,
            });
            options.push({ nameStr : `Sex`,
                func() {
                    Text.Clear();

                    const scenes = [];

                    scenes.push(() => {
                        Text.Out(`Just why is he so horny all the time?

                        “What do you mean?” Ophelia asks, cocking her head to the side.

                        Well, from what you gather, he craves sex constantly, right?

                        “Doesn’t everyone?” She looks puzzled. “Sure, he spent a lot of time in the Pit, but so do almost all of my brothers and sisters. I feel the same urges, but I try to not let it get in the way of my research.”

                        Well, the brothel sounds like a perfect place for him.

                        “I’m glad that brother has found somewhere to call home outside!” the alchemist says cheerfully. “Was there something else you wanted to ask?”`);
                    });
                    scenes.push(() => {
                        Text.Out(`Who was Roa’s favorite partner? And how did he prefer to have sex?`);
                        Text.NL();
                        if (roa.flags.Met >= RoaFlags.Met.Sexed) {
                            Text.Out(`“You’ve been with him, and you couldn’t tell? Guess you aren’t as sharp as I thought, ${pc.name},” Ophelia replies smugly. `);
                        }
                        Text.Out(`“When he has the urge, brother will have sex with anyone in order to get release. He very much prefers being fucked over fucking, though, and the bigger the better.” The alchemist adjusts her glasses, peering at you. “Sadly, that meant I couldn’t always satisfy him, but being with him was still nice. I found some ways, but I couldn’t compare to a thick, juicy cock.”

                        What ways would that be?

                        “Oh, I’d work him with my fingers or my tongue. He’d yelp in the cutest way.” Ophelia smiles fondly. “I’d also sometimes ask another one of my brothers to fuck him while he fucked me. He liked that.”

                        How about when he visited the Pit?

                        “Oh, he was quite popular. With that pink fur, he’s very cute, you know. Every now and then, father would take him. Dad’s huge, and he can be very rough, but Roa told me he didn’t mind.”`);
                    });
                    scenes.push(() => {
                        Text.Out(`What’d Roa make of this new brute strain that Ophelia’s experiments have given rise to? Those giants sound like something that’d be right up his alley.

                        “Certainly,” she nods. “A cock that size would keep him happy for hours on end. I’m sure he’d appreciate their stamina as well.”

                        Could he really take someone that big?

                        “I’ve seen him take dad; they’re not much bigger than him.”`);
                    });
                    scenes.push(() => {
                        Text.Out(`How about the recent surge of hermaphrodites in the burrows, what’d Roa make of that?

                        “Might make him a bit more interested in girls, that’s for sure,” Ophelia grins fondly. “Don’t get me wrong; he was before, but with that extra piece of equipment, he’d be completely infatuated.”

                        “I’m sure my sisters would have a fun time with him too.”`);
                    });
                    if (roa.flags.Met >= RoaFlags.Met.Sexed) {
                        scenes.push(() => {
                            Text.Out(`“So… um, you’ve fucked my brother, haven’t you?” She peers at you inquisitorially.

                            ...You have, you confirm.`);
                            Text.NL();
                            if (ophelia.flags.Talk & OpheliaFlags.Talk.Sex) {
                                if (player.sexlevel > 3) {
                                    Text.Out(`“I’m sure he was as satisfied as I was,” Ophelia nods to herself confidently.`);
                                } else {
                                    Text.Out(`“I hope you enjoyed yourselves,” Ophelia nods to herself.`);
                                }
                                Text.Out(` “And?” she grins, her eyes twinkling behind her glasses. “Which one of us did you prefer?”

                                That’s a bit unfair…

                                “Don’t worry,” she giggles, “I’m just teasing. You outsiders have such strange conceptions about sex.”`);
                            } else {
                                Text.Out(`“I do hope you satisfied him, ${pc.name},” Ophelia studies you curiously.

                                What, she doesn’t believe that you’re able?

                                “Now now, I’m a scientist, you know,” she admonishes you. “I back my observations with empirical data. It just so happens I don’t have any on you… yet.”`);
                            }
                        });
                    }

                    let sceneId = ophelia.flags.rotRSex;
                    if (sceneId >= scenes.length) { sceneId = 0; }

                    ophelia.flags.rotRSex = sceneId + 1;
                    // Play scene
                    scenes[sceneId]();

                    Text.Flush();
                    OpheliaScenes.TalkPrompt();
                }, enabled : true,
                tooltip : `Ask about Roa’s attitude to sex, and his uncanny libido.`,
            });
            Gui.SetButtonsFromList(options, false, undefined);
        }
    }

    export function TalkVena() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        const first = !(ophelia.flags.Talk & OpheliaFlags.Talk.Vena);

        if (!burrows.VenaRestored()) {
            Text.Out(`“Regardless, and since she’s unable to, I’d be happy to talk to you about her. What exactly did you have in mind in regards to mother?”`);
            Text.NL();
        }
        Text.Out(`Well... for starters, what kind of person was she like? Before she wound up as the centerpiece in the Pit?

        “Mom was always caring and nice. She’s what kept father in check. I mean, she’d always valued father’s opinion and his desires, but she also had opinions of her own. They argued a lot, but mom would always come out on top. She was as much our queen, as father was our king.”

        Sounds like it was a pretty good relationship, something healthy for all concerned.`);
        Text.NL();
        if (burrows.VenaRestored()) {
            Text.Out(`So, has she noticed any changes in Vena’s personality, since the two of you restored her? Between what Lagon did to her, and her other transformations, it wouldn’t surprise you if the queen rabbit was at least a little different.

            Ophelia smiles and shakes her head. “No, mother is still the same as ever. She’s truly a strong rabbit. I don’t think I’d even be the same if father did the same to me.”

            You think Ophelia isn’t giving herself enough credit, but she is right; Vena must be one tough bunny to come through that without even the slightest of changes. You’d have expected having to adjust to being a herm at the least would make her a little different.`);
            Text.NL();
        }
        Text.Out(`So, Ophelia mentioned that her parents would argue a lot - what exactly did they argue about?

        “It was mostly about our family. Father always thought we should grow and expand, while mother just wanted us to be a family and not worry about any of that. My father used to call her short-sighted, but in the end, mom would always make him see things her way.”

        An idle curiosity about exactly <i>how</i> Vena accomplished that flashes a fin, but you dismiss it. Something else has your attention. Cautiously, you ask if Ophelia has any idea how or when that changed - when Vena stopped being the queen of the burrows and became the breeder in the pit.

        Ophelia’s ears flatten. `);
        if (ophelia.Relation() < 30) {
            Text.Out(`“I’m sorry, ${pc.name}, but that’s really not something that I’d like to talk about. I lost so much that day… I’m sorry.”

            You apologize for bringing it up; you didn’t want to make her uncomfortable like that. You decide to switch to a more neutral topic, once she’s had a moment to collect herself.`);
        } else {
            Text.Out(`She takes a deep breath and visibly steels herself. “That day… it was all my fault.”`);
            Text.NL();
            if (first) {
                Text.Out(`You place a comforting hand on Ophelia’s shoulder. It wasn’t her fault, you assure her. She created the potion, yes, but Lagon was the one who tricked Vena into taking it. Lagon is to blame here, not Ophelia.

                “Thank you for saying that, ${pc.name}, but I still feel guilty all the same...”

                Well, she shouldn’t, and you tell her this firmly. The only one to blame here is the corrupt soul who poisoned her mother in the first place. All of the guilt is Lagon’s, not hers.

                “Thank you, ${pc.name}. Can we talk about something else?”

                Of course, you don’t want to make her uncomfortable.`);
                ophelia.relation.IncreaseStat(45, 1);
            } else {
                Text.Out(`How could that possibly be? Ophelia clearly loves her mom; she’d never have done anything to hurt her! You simply don’t believe it.

                “I was experimenting as usual, and I’d just made a new potion. I had tested it on a sister of mine, and she instantly became lustful and wanted nothing more than to have sex. It’s like that was the only thing she could think about.”

                The thought occurs to you that doesn’t sound much different to how Ophelia’s siblings are normally, but you stay silent, allowing her to continue her story unabated.

                “Back then, whenever I made a discovery, I would present my findings to mom and dad. Mother would usually congratulate me and father would offer some comments on what I had created. This time, mother praised me as usual, but said the potion didn’t have much use and I should dispose of it.”

                You can see her mother’s point there. As much fun as sex might be, someone incapable of doing anything but fuck 24/7 would be kind of useless for keeping the colony going.

                “I was understandably bummed. I thought my discovery would help the colony - particularly my shyer brothers and sisters - but if mother didn’t think it was going to be useful, I might as well as dispose of it. Father hadn’t said anything, but by then that was no surprise. This wasn’t the first of my discoveries that he had ignored. I was so naive... ”

                At Ophelia’s crestfallen expression, and thinking back to your own interactions with King Rabbit, you have a sinking feeling about what happened. Quietly, you confirm the worst: Lagon used the potion on Vena, didn’t he?

                “Yes,” she replies, tearing up. “I should have done what mother instructed me to right then, but I didn’t want to waste what I thought was a perfectly good potion, so I kept it in my lab. Father stole it and drugged mother, and then he took control of the colony. With no one to oppose him, we quickly became what you see.”

                Instinctively, you try to comfort Ophelia. She shouldn’t blame herself; she wasn’t the one who drugged her mother, this is Lagon’s fault, not hers.

                At your words, Ophelia seems to break down. The lab-coated lapin throws her arms around you and hugs you as tightly as she can manage. Her face buries itself against your ${pc.breasts}, tears dampening your ${pc.armor} as she sobs loudly.

                A little awkwardly, you hug her back, stroking her hair in an attempt to calm her down as she hangs on for dear life. You lose track of time as she weeps against you, but finally, she seems to cry herself out. She sniffles loudly, nuzzles her face against your chest to try and dry her face off, and then gently pushes back from you, breaking the embrace.

                “Thank you, ${pc.name}.” She smiles.

                You pet her head and smile, assuring her that you don’t mind. Now, why don’t the two of you talk about something else?`);
                ophelia.relation.IncreaseStat(100, 3);
            }
            ophelia.flags.Talk |= OpheliaFlags.Talk.Vena;
        }
        Text.Flush();
        OpheliaScenes.TalkPrompt();
    }

    // TODO
    export function SexEntryPoint() {
        const player: Player = GAME().player;
        const ophelia: Ophelia = GAME().ophelia;

        // [name]
        const options: IChoice[] = [];
        if (player.FirstCock()) {
            options.push({ nameStr : `Vaginal`,
                func() {
                    ophelia.flags.Talk |= OpheliaFlags.Talk.Sex;
                    OpheliaScenes.SexVaginal();
                }, enabled : true,
                tooltip : `Well, if she wants to research, the traditional way is always the best.`,
            });
        }
        /* TODO
        options.push({ nameStr : `name`,
            func : () => {
                ophelia.flags[`Talk`] |= OpheliaFlags.Talk.Sex;
                Text.Clear();
                Text.Out(``);
                Text.NL();
                Text.Flush();
            }, enabled : true,
            tooltip : ``
        });
        */
        Gui.SetButtonsFromList(options, true, () => {
            Text.Clear();
            Text.Out(`“Suit yourself,” she shrugs, looking disappointed.`);
            Text.Flush();
            OpheliaScenes.LabPrompt();
        });
    }

    export function SexVaginal() {
        const player: Player = GAME().player;
        const p1cock = player.BiggestCock();
        const knotted = p1cock ? p1cock.knot !== 0 : false;
        const pc = player.Parser;
        const c = new GP.Plural(player.NumCocks() > 1);
        player.SetPreferredCock(p1cock);

        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        Text.Clear();
        Text.Out(`“Sounds good to me. You should probably undress,” she points out.

        Well, what would you expect from a bunny? Without hesitation, you start to remove your ${pc.armor}, putting your belongings aside where you’re reasonably certain that they’re not going to get dirty.

        Ophelia just looks at you undress with a smile, no doubt admiring the view. You can see her reaching between her legs.

        From the look on Ophelia’s face, the bunny is clearly waiting for you to make the first move. Now, how to get her out of that coat...?`);
        Text.Flush();

        // [Slowly] [Don’t bother]
        const options: IChoice[] = [];
        options.push({ nameStr : `Slowly`,
            func() {
                Text.Clear();
                Text.Out(`A smile on your lips, you stride purposefully toward Ophelia. The female lagomorph smiles a little nervously at you, excitement obvious as she shifts her weight from foot to foot. Tenderly, you reach out with your hand, running your digits through her soft hair, and then you shift upwards. You take the rim of her elongated ear between forefinger and thumb, stroking the sensitive flesh with delicate twitches of your fingers.

                She moans softly, body turning to jelly as she almost creams herself over your tender touch. The pitter-patter of her arousal reaches your ${pc.ears} and you smile. If she wasn’t ready then, now she’s more than ready.

                That’s what you were hoping for, but you’re not done playing yet. The hand that was stroking her ear loosens its grip, creeping down along her face. Playfully, your fingers stroke her cheek, and then curl under her chin. You lift her face so you can sweetly claim the lapin’s lips in a passionate kiss.`);
                Text.NL();
                if (ophelia.Relation() < 15) {
                    Text.Out(`She’s surprised at first, but with some coaxing, she grants you entrance and begins kissing you back.`);
                } else if (ophelia.Relation() < 30) {
                    Text.Out(`Ophelia kisses you back, granting you entrance as well as probing your own mouth with her tongue.`);
                } else {
                    Text.Out(`She returns it with almost as much fervor, her own tongue dancing with yours as she moans into your kiss.`);
                }
                Text.NL();
                Text.Out(`Even as you and Ophelia make out, your other hand starts to move. You reach out and take the flap of her lab coat. An idle thought flashes through your brain, thankful that she doesn’t button it. Fingers close around the fabric and you start to slide it open, exposing the supple curve of her neck and dainty shoulder.

                Your lips detach from Ophelia’s, leaving her gasping for breath. Releasing her chin, you make your way down her neck. Her soft fur tickles slightly, brushing against your nose as you open your mouth. Your teeth close against her skin, just hard enough that the lapin can feel them grazing her flesh in a primal kiss.

                Ophelia lets out a soft squeak, wriggling against you in response. She makes no efforts to pull away, quite content to let you ravish her. What a good bunny...

                Even as you play, you don’t forget your objective. With both your hands free, Ophelia’s coat offers no resistance. One hand closes upon her collar, gently pulling it back away from the nape of her neck. The other, still fastened upon the flap of her coat, draws its piece further along. Her arm slides free of the sleeve, allowing half of the coat to hang limply down her back.

                Lifting your head from Ophelia’s neck, the swell of her now-exposed breast is the first thing to catch your eye. Almost absently, you release the loosened flap of her coat. The hand on her collar starts to pull, drawing the remainder of her coat off of her body, allowing it to fall into a heap behind her rabbit-like paws.

                With that little distraction out of the way, your free hand closes around one pert breast. It squishes nicely between your fingers, coaxing you to squeeze and knead. Firm enough that she can feel it, but tender enough to not hurt, you enjoy the feel of her in your palm, complimenting her on what a nice set of tits she has.

                She moans softly at your touch, thighs grinding together as her juices flow freely. “M-my nipples,” she pleads.

                How could you possibly refuse such an earnest request? You slide your fingers about her breast so you can grasp the nipple between forefinger and thumb. Adjusting your stance, your mouth lowers to the unoccupied teat. As your lips part, your ${pc.tongueTip} slide forth, just barely touching the pink pearl of flesh.

                The taste of her washes over your ${pc.tongue} as you lick her nipple. In circles and spirals, you trail your tongue-tip over Ophelia’s little bud, feeling every bump and groove sliding under your tongue. At the same time, your hand caresses and squeezes her other nub, tenderly matching your oral ministrations.

                The lapin alchemist groans, arms looping around your head as she pushes you against her soft breasts. “More!”

                Feeling your ${pc.cocks} throbbing with need, head swimming with the scent of her womanhood, you couldn’t agree more with her statement. Boldly, you nip at her nipple, eliciting a sharp squeal of surprise from the female rabbit. Her arms slacken, and you seize control.

                Rising back to your full height, it is your turn to wrap your arms around her. Seizing her by the hips, not even pausing to enjoy the squish of her buttocks in your palms, you sweep her off her feet, eliciting a surprised squeak from the horny bunny.

                You can feel the warm wetness drooling over your ${pc.thighs} as Ophelia’s nectar flows freely. The scent of her lust floods your nostrils, making you ache as you stagger to a convenient spot and lay Ophelia down on her back.

                The rabbit needs no words, no encouragement. She spreads her legs the second her hips hit the ground, little pink tongue dabbing hungrily at her lips as she gazes up at you expectantly. Once she’s in place, you loom over her, a hand on her shoulder, the other anxiously aligning${c.oneof} your ${pc.cocks} with her womanhood.

                You pause for just a second, feeling the hot fluids already smearing over your ${pc.cockTip}, and then begin to push forward.

                There’s not the slightest resistance. You don’t think there would be much anyway, but with Ophelia absolutely sopping wet as she is, she might as well be twice her actual size. Without the slightest impediment, your ${pc.cock} glides home into hot, sloppy, velvety flesh, already trying to suck you deeper.`);
                Text.NL();

                Sex.Vaginal(player, ophelia);
                ophelia.FuckVag(ophelia.FirstVag(), player.FirstCock(), 3);
                player.Fuck(player.FirstCock(), 3);

                Text.Out(`“Ah, yes!” Ophelia cries, legs wrapping around your waist as she tries to bring you deeper inside her.

                With Ophelia’s encouragement, you push on into her sodden depths, not stopping until she has taken you to the very hilt. `);
                const lCock = new Cock();
                lCock.thickness.base = 7;
                lCock.length.base = 38;
                const asBigAsLagon = p1cock.Volume() >= lCock.Volume();
                if (asBigAsLagon) {
                    Text.Out(`Her stomach bulges visibly around the sheer quantity of man-meat crammed inside her snatch, but the distension only seems to arouse her further.

                    “Omph! You’re pretty big. Might not have been such a good idea to take all of you like that.”

                    Her words penetrate your budding haze, and you ask if she’s okay.

                    “Don’t worry about me. I’m fine, just need to get... unf... adjusted,” she says, wiggling herself to find a better position.

                    An appreciative moan escapes your throat as muscles deep within her flex and twist to match the ones in her legs. You don’t know if she’s doing it purposefully or not, but you don’t really care.

                    “There, that’s good,” she smiles. “I’m ready... so show me what you can do.”

                    With all due pleasure...`);
                } else {
                    Text.Out(`“You’re not the biggest partner I’ve had, but you fit snugly,” she notes.

                    Reaching out with your free finger, you tap her playfully on the nose. Size isn’t everything when it comes to this, you mock-chide her.

                    “Oh, sorry. I meant no offense,” she says in mild embarrassment. “It’s just that when my partner is too big, it can hurt a little.”

                    No offense taken, you assure her.

                    “Well, then. You said something about making up for your size. Care to show me?” She grins.

                    Gladly...`);
                }
                Text.NL();
                const b = player.HasBalls() ? ` and dripping onto your balls` : ``;
                const k = knotted ? ` without knotting yourself` : ``;
                const cock = player.NumCocks() > 1 ? `, your other cock${c.notS} spilling ${c.itsTheir} seed upon the ground` : ``;
                Text.Out(`Running your fingers fondly through her hair one last time, you place your hands on her hips. Balance restored, you inhale deeply, and start to thrust as best you can with Ophelia’s legs locked in their death grip upon your waist. You slide backwards, nearly drawing your ${pc.cock} free of her, and then push forward again. Slow and steady, you build a rhythm, pumping your hips with smooth, easy motions. Her fluids glaze slickly over your phallus, oozing over your ${pc.thighs}${b} at the motion.

                “Hmm, yes. That feels good. Try to thrust a bit more to the right.”

                Your gaze flicks down to Ophelia, whose own eyes are screwed tightly shut. She bites her bottom lip, then lets out a mewl of pleasure as you follow her instructions. It is her body, after all; listening to her should be good for both of you.

                “Ooh! Yes, right there,” she says, moaning loudly as you rub her most sensitive spots with your ${pc.cock}.

                Ophelia rewards you with ever-firmer squeezes, her silken walls rippling as she does her considerable best to milk you. The feel of her, the sight of her writhing blissfully beneath you, it stokes your own pleasure higher and higher. Deep inside you, the sensation wells up, mounting like a wave about to crash down - it’s all you can do to keep your rhythm.

                Trembles wrack your body as your will starts to crumble. Gasping for air to try and hold back the inevitable, you warn Ophelia that you’re about to cum.

                The bunny gazes at you with lust-ridden eyes, completely lost in the pleasure of the act. “Ahn! Do it! Fill Ophelia’s pussy with your hot cum! I <b>need</b> it!”

                Hearing the wanton words spilling from her mouth is the final straw. With a cry of pleasure, you bury your ${pc.cock} as deep into her willing cunt as you possibly can${k} and let fly${cock}.`);
                Text.NL();

                const cum = player.OrgasmCum();

                if (cum > CumLevel.Mid) {
                    Text.Out(`You can almost see Ophelia’s stomach explode outwards as your first titanic shot erupts into her waiting cunt. A cascade of cream surges inside of the lusty lapin, making her belly swell enormously as you continue pouring inside. By the time you finally finish, Ophelia is sporting a huge potbelly, nearly as big as Vena’s ${burrows.VenaRestored() ? `was, back when she was trapped in the pit` : `seemingly permanent breeder’s gut`}.

                    The bunny alchemist’s cunt continues to milk your ${pc.cock}, despite there being no more room inside her womb. “Haa… Haa… So full...”

                    Panting for breath, you manage to gasp out a query, asking her if she’s alright.

                    “Y-yeah, but you should probably pull out. Let some pressure out,” she says with a groan.

                    It’s not easy; despite Ophelia’s words, her cunt has a death grip on your cock. Finally, you manage to pop yourself free like a perverse cork from a bottle of champagne - a mental image strengthened by the rivers of white near-froth that come spilling from her gaping hole.

                    Ophelia sighs hugely in relief, toes wriggling as the pressure starts to ease.`);
                } else if (cum > CumLevel.Low) {
                    Text.Out(`Thick ropes of semen pour from you, flooding into your lover’s cunt like an incoming tide. Like bread in an oven, her belly starts to rise, stomach bulging out into a great, cum-stuffed dome that juts from her midriff like a monument to your efforts.

                    Only when you come down from your orgasmic high do you notice Ophelia’s pussy is still rippling in an effort to milk you, even though you don’t have any more seed to give her. “Hng… m-more...” she says airily.

                    With an exhausted laugh and a shake of your head, you inform her that you don’t have any more to give her.

                    “That’s too bad. I’m feeling so full...”

                    You quip back that she looks it too. In fact, you doubt she could hold much more than this, so she best stop tempting you...

                    Ophelia pouts a little, but you won’t be swayed. Instead, you slide free of her hole, watching as a nearly equal mixture of your cum and hers pours in a perverse river from the twitching labia.`);
                } else {
                    Text.Out(`Nearly washed away in the rivers of female honey already pouring from Ophelia’s womanly flower, your seed vanishes into her depths, gamely doing its best to get to where it belongs.

                    “Aah… that hit the spot,” Ophelia says, rubbing her belly.

                    Inhaling deeply and steadily, you finally manage to grin at her, assuring her that you’re happy to please her.

                    Ophelia just smiles at you. “So… are you done or are you keeping me pinned to the ground for a reason?” she asks teasingly.

                    Well, if she wants you off that badly... You pet her cheek, and then pull yourself free of her well-used hole. Thick ropes of bunny-honey trail from your member, splatting heavily onto the ground at your feet.`);
                }
                Text.Flush();

                Gui.NextPrompt(() => {
                    Text.Clear();
                    Text.Out(`Ophelia wipes her glasses with the hem of her lab coat. It takes a bit of time for the rabbit alchemist to recompose herself, but she finally finishes and looks at you. She clears her throat before starting. “Based on my research, I conclude that sex with an outsider is… very fulfilling,” she smiles. “I believe there is more to be discovered, but further testing would be required. If the subject is willing?”

                    Of course, you’d be very willing, but... you need a moment or two.

                    “As soon as you are willing then. I love researching, you know?” she says with a grin.

                    Well, you can definitely understand the appeal it has yourself. Winking back at her, you excuse yourself and leave.`);
                    Text.Flush();

                    ophelia.relation.IncreaseStat(50, 1);
                    TimeStep({hour: 1});

                    Gui.NextPrompt();
                });
            }, enabled : true,
            tooltip : `Why not have some fun before you get down to business? A little foreplay never hurt anyone...`,
        });
        options.push({ nameStr : `Don’t bother`,
            func() {
                Text.Clear();
                Text.Out(`No sense in beating around the bush, you know what you want and what she wants. Without further ado, you tell her to get on all fours as circle behind her. She complies without protest, looking over her shoulders to watch your movements as you move to lift the hem of her lab coat and grab her ass.

                Ophelia moans as you begin massaging her rump. Her lab coat usually keeps it hidden, but the truth is that she has a very nice ass. Fit for a breeder.

                “Thank you- Ah!”

                The rabbit’s whole body jolts as your hand cracks against one firm butt cheek. The perky flesh ripples and jiggles deliciously, but you have already moved on.

                Your hand slides along Ophelia’s inner thigh. The white fur is silken soft there, brushing tenderly against the skin of your fingers as you caress her. Moving your hand toward her crotch, you seek out the womanly treasure that lies there.

                Without fail, your fingers find what they seek. Warm fluid, slightly sticky in consistency, oozes sluggishly over your probing digits. Its touch draws you on, guiding you home. Your probing tells you all that you need. Under your hand, you can feel Ophelia’s petals, spreading slightly as you trace their edges. They scarcely need any pressure at all to coax them open.

                She’s already nice and wet like a good little bunny slut, but you think she needs a little more before you’re ready to begin...

                Investigating blindly, your digits trail around the rabbit’s plump netherlips, working their way to her hood and the helpful little button sprouting from it. A quiet gasp of pleasure reaches your ears as you close forefinger and thumb upon Ophelia’s clitoris, squeezing firmly yet carefully. You roll the nub of flesh across the surface of your fingers, feeling its softness against your skin.

                The rabbit moans wantonly, her knees buckling as she shakes in pleasure. “Ophelia wants it! Give it to Ophelia!” she cries.

                Warm wetness spatters across your wrist and your forearm, as if you needed more proof that she is ready. Without further ado, you release her clitoris and assume your own position behind her. One hand rests itself upon her buttocks, absently kneading the plump orb. The other hand reaches down, closing around${c.oneof} your ${pc.cocks} to align it with her entrance.

                Once you are ready, you thrust forward without a word, impaling Ophelia upon your shaft.`);
                Text.NL();

                Sex.Vaginal(player, ophelia);
                ophelia.FuckVag(ophelia.FirstVag(), player.FirstCock(), 3);
                player.Fuck(player.FirstCock(), 3);

                const k = knotted ? ` - just barely stopping yourself from knotting -` : `,`;
                Text.Out(`“Ah! It’s inside Ophelia!” she cries as her trained cunt grasps your member, milking you and sucking inside.

                You wonder for a second where the smart, level-headed bunny of before went. Is this something sex does to her, or does she think it pleases you to hear her like this? The thought barely crosses your mind before you dismiss it. There are more important things to occupy yourself with.

                With a hand on either side of the lagomorph, you buck your hips forward, burying another few inches of dickflesh into your partner. Silky, steaming hot flesh surrounds you, flexing and squirming against your intruding flesh. Audible slurping reaches your ears as you pull back and then thrust home again, eliciting a groan from Ophelia.

                The perception of time fades away, losing all meaning to you. There is only the slap of flesh on flesh, the feel of Ophelia’s pussy milking you dry, and the pleased moans of a horny bunny beneath you. You thrust away, firm and fast, building up as quick a rhythm as you can manage.

                Eventually, you can feel the pressure welling within you, building at the base of your spine. Spots flash in front of your eyes and you cry out. You make one final, fierce thrust into Ophelia’s used cunt${k} exploding inside her waiting depths.

                “Ahn! Ophelia can feel the cream!”`);
                Text.NL();

                const cum = player.OrgasmCum();

                if (cum > CumLevel.Mid) {
                    Text.Out(`Underneath your bodies, Ophelia’s stomach begins to bulge and swell. Like a ripening fruit, it grows rounder and fuller, hanging down under its new weight. It sways slightly as the two of you shift, full to the point that rivers of seed keep backwashing out around your ${pc.cock}, but still it grows. Her belly button begins to drag along the ground, forcing her to grow several inches outward rather than downward before you finally stop.

                    “Hng… full...” she groans.

                    Glancing down, somewhat awkwardly, you can see the reason why. You absently pet her on the small of her back, promising her you’ll help with that. As carefully as you can, you pull yourself free - not an easy task while she clings to you with her cunt, despite her complaints. A veritable waterfall of semen pours from her backside as you do.`);
                } else if (cum > CumLevel.Low) {
                    Text.Out(`Under the sheer weight of your climax, the lagomorph’s stomach begins to distend. Gravity greedily grasps the growing gut, exaggerating its size as it is pulled closer to the earth. By the time your climax finishes, each motion the two of you makes causes it to sway like a ripened fruit in the breeze.

                    “Ahh. So much hot cum,” she says, panting.

                    You’re glad she approves. Placing a hand on her butt for leverage, you start to pull yourself free. It takes a bit of force, but you finally manage to escape her clutches. In your wake, her pussy continues to drool seed, despite its best efforts to hold it in.`);
                } else {
                    Text.Out(`All you have to offer is swallowed greedily into the bunny’s waiting depths. Even when you run dry, her pussy continues to flex and squirm, as if hoping to milk you of just one more drop of seed.

                    “Hmm… More?” she asks, looking over her shoulder with lusty eyes.

                    No, no more, you reply. She pouts, but you won’t be swayed. It takes a surprising amount of effort to pop yourself free of her grasping pussy; she’s quite strong down there...`);
                }
                Text.NL();
                Text.Out(`You make yourself comfortable; the both of you are quite worn out from your little escapade. It’s going to take some time before you’ll feel like moving.`);
                Text.Flush();

                Gui.NextPrompt(() => {
                    Text.Clear();
                    Text.Out(`As Ophelia lets go of your hand, fully back on her feet, you look around at the considerable mess the two of you made, and you apologise. It looks like you got a little more carried away than you thought.

                    “Don’t worry about that, I’ll have one of my assistants clean that up later. Or maybe I’ll scoop up some for experimenting...”

                    With a nod of acceptance, you move on to a more important matter - asking how you did.

                    “Not bad, ${pc.name}. Fucking like that, you would fit in perfectly with my family.”

                    You reply that sounds like pretty high praise, coming from her.

                    She smiles. “Personally, I wouldn’t mind seeing what else you can do, but we should do that another time.”

                    You’ll have to keep that in mind. For now, you have other matters to attend to, and so you say your goodbyes and leave.`);
                    Text.Flush();

                    ophelia.relation.IncreaseStat(35, 1);
                    TimeStep({hour: 1});

                    Gui.NextPrompt();
                });
            }, enabled : true,
            tooltip : `She doesn’t wear panties, why go to the trouble of taking it all the way off?`,
        });
        Gui.SetButtonsFromList(options, false, undefined);
    }

    export function LabPrompt() {
        const player: Player = GAME().player;
        const party: Party = GAME().party;
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        // [name]
        const options: IChoice[] = [];

        options.push({ nameStr : `Talk`,
            func() {
                Text.Clear();
                if (burrows.VenaRestored()) {
                    Text.Out(`“Sure, I got time. What would you like to talk about?”`);
                } else if (burrows.LagonDefeated()) {
                    Text.Out(`“Alright, I can spare a few moments to chat, but we really need to restore mother before the colony descends into chaos.”`);
                } else {
                    Text.Out(`“Okay, I can spare a few moments, but don’t take too long. I really need to get back to my research.”`);
                }
                Text.Flush();

                OpheliaScenes.TalkPrompt();
            }, enabled : true,
            tooltip : `Have a chat with the bunny alchemist.`,
        });

        OpheliaScenes.TraitPrompt(options);

        options.push({ nameStr : `Potions`,
            func() {
                Text.Clear();
                Text.Out(`“If you have any, I’ll trade you coins for new alchemical brews that may be of use to the colony.”

                Do you offer any potions to Ophelia?`);
                Text.Flush();

                OpheliaScenes.PotionsPrompt();
            }, enabled : true,
            tooltip : `Donate some of your alchemical stock to Ophelia.`,
        });
        options.push({ nameStr : `Sex`,
            func() {
                Text.Clear();
                const first = !(ophelia.flags.Talk & OpheliaFlags.Talk.Sex);
                if (first) {
                    Text.Out(`The lapin alchemist looks you over for a moment, then breaks into a soft smile. “Okay, I’ll admit I haven’t had any experience with outsiders. I’m curious about how you’d perform...” she trails off tapping her chin in thought.`);
                    Text.NL();
                    if (player.sexlevel >= 5) {
                        Text.Out(`With a confident grin, you assure her that she’s never had anyone like you before, of that you’re certain.`);
                    } else if (player.sexlevel >= 3) {
                        Text.Out(`None of your other partners have ever complained; you doubt she’ll be the first.`);
                    } else {
                        Text.Out(`Well, the two of you will just have to see. This ought to be a learning experience for the both of you.`);
                    }
                    Text.NL();
                    Text.Out(`“I guess there’s just one way of finding out then. What do you have in mind for us?”`);
                } else {
                    Text.Out(`“I’ll never say no to more research,” she says with a smile.

                    With a chuckle, you note that you doubted she would.`);
                }
                Text.Flush();
                OpheliaScenes.SexEntryPoint();
            }, enabled : true,
            tooltip : `Ask if Ophelia’s interested in have sex with you.`,
        });
        if (burrows.flags.Access < BurrowsFlags.AccessFlags.QuestlineComplete && party.Inv().QueryNum(QuestItems.Scepter)) {
        options.push({ nameStr : `Scepter`,
            func() {
                OpheliaScenes.TurnInScepter();
            }, enabled : true,
            tooltip : `Give Ophelia the scepter.`,
        });
        }
        // TODO
        /*
        options.push({ nameStr : `name`,
            func : () => {
                Text.Clear();
                Text.Out(``);
                Text.NL();
                Text.Flush();
            }, enabled : true,
            tooltip : ``
        });
        */

        Gui.SetButtonsFromList(options, true);
    }

    export function TurnInScepter() {
        Text.Clear();
        Text.Out(`“You brought it?” Ophelia drops what she’s working with, throwing herself into your arms. “Thank you!” Tears are streaming down her cheeks. “You don’t know how much this means to me. Trying to take care of things here alone has been so difficult...” You comfort her as best you can, then hand over the scepter.

        “Let me find it...” the bunny scrambles through her notes, retrieving the scroll that details the workings of the scepter. You look over her shoulder as she studies it. The scroll makes no mention of the scepter itself, but describes the gemstone in quite a lot of detail.

        “You found it without any problems? What about my brother?” Her eyes grow larger and larger as you describe your adventures to retrieve the scepter.

        The alchemist motions for you to follow, studying the rod as the two of you head toward the Pit. The queen’s guards silently fold in around you, staying close to their interim matriarch.`);
        Text.NL();
        VenaScenes.RestoreEntrypoint(false);
    }

    export function PotionsPrompt() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const ophelia: Ophelia = GAME().ophelia;
        const oph = ophelia.Parser;
        const party: Party = GAME().party;
        const burrows: Burrows = GAME().burrows;

        const options: IChoice[] = [];
        if (burrows.flags.Felinix === 0) {
            options.push({ nameStr : `Felinix`,
                func() {
                    Text.Clear();
                    Text.Out(`“Feline you say?” Ophelia looks thoughtfully at the offered bottle, giving it a swirl experimentally. Finally, she shakes her head and returns the bottle to you.

                    “We are already quicker than the cats. I don’t really see how this will help us.”`);
                    Text.Flush();

                    burrows.flags.Felinix = 1;

                    OpheliaScenes.PotionsPrompt();
                }, enabled : party.Inv().QueryNum(AlchemyItems.Felinix) !== undefined,
                tooltip : `Introduce Felinix into the diet of the colony.`,
            });
        }
        if (burrows.flags.Lacertium === 0) {
            options.push({ nameStr : `Lacertium`,
                func() {
                    Text.Clear();
                    Text.Out(`“To be honest, I’m not sure what giving this to rabbits would do...” Ophelia studies the bottle of Lacertium carefully. “Protective scales? Perhaps it will make us lay eggs? Only one way to find out I guess...” The lapine alchemist hops over to two of her chained test subjects, one male and one female.

                    “Now, be good assistants and drink up!” She nods encouragingly to the bunnies as they gulp down the strange substance. “Have a seat,” she suggests, gesturing to a bench. The potion begins to take hold almost immediately as both of the guinea pigs grow slightly sleeker, and the faintest hints of pale scales poke out from under their fur on their arms, legs and shoulders. Their tails elongate to about three feet, and are covered in smooth, soft scales on their underside with white fluffy fur on the top. The same soft scales snake down their stomachs from chest to crotch.

                    The solution seems to have some rather more dire effects as well, as both the male and female lagomorph fall to the ground, grunting and moaning as they clutch their stomachs. Ophelia looks briefly concerned, before it becomes clear that it isn’t pain, but pleasure, that ails them. With her foot, she carefully rolls the male over onto his back, gasping in surprise as his genitalia are revealed. Where before there was but one member, two thick shafts sprout from his groin, glistening wetly in the faint light.

                    “Quite interesting!” Ophelia croons excitedly. “There doesn’t seem to be any traces of a reptilian slit, and his testes are still intact. Good thing too, as he’s likely to need them if he’s to sire a new strain.” A startled whimper diverts the alchemist’s attention to the other rabbit, who is sitting with her hands covering her lap, legs pressed together tightly and blushing fiercely.

                    “What is wrong, girl? Don’t tell me you grew one too. Now then,” the lagomorph scientist tuts, forcing the bunny’s legs apart, “what do we have-” You peek over her shoulder curiously, wondering why she grew silent. It’s quite a sight.

                    Nested between her thighs, there are about a dozen pink eggs, each roughly the size of an apple. Ophelia picks one of them up in wonder. “Never thought I’d see this pop out between someone's legs,” she confesses. “So many of them too… no! Down!” The alchemist irritably swats away the girl’s hands as she possessively reaches for her egg.

                    “They aren’t fertilized, silly,” Ophelia scoffs, though she relents and returns the egg to the agitated bunny, who cradles it protectively. “That will be the next step of the test.” Rubbing her hands together excitedly, she calls for some guards to escort the new hybrids to a breeding chamber, to see how well the strain will proliferate.

                    “I need to observe the strength of the offspring, and how long the gestation period is. Still, I think it shows promise… perhaps some minor alterations to the formula.” Ophelia hands you a bag of coins from her hidden stash, already deep in thought on how to further improve the new strain.

                    <b>You receive 150 coins!</b>`);
                    Text.Flush();

                    party.coin += 150;
                    TimeStep({hour: 1});
                    burrows.flags.Lacertium = 1;

                    OpheliaScenes.PotionsPrompt();
                }, enabled : party.Inv().QueryNum(AlchemyItems.Lacertium) !== undefined,
                tooltip : `Introduce Lacertium into the diet of the colony.`,
            });
        }
        if (burrows.flags.Equinium === 0) {
            options.push({ nameStr : `Equinium`,
                func() {
                    Text.Clear();
                    Text.Out(`“Oh, I’ve been searching for this!” Ophelia almost snatches the bottle from your hand, swirling the liquid around excitedly. “We lagomorphs may be quick on our feet, but we are not very physically strong. Well, if you discount my father,” she corrects herself. “Either way… the reproductive rates of my own race combined with the strength and size of the equines… I need to test this right now!”

                    You wonder if this might have been a bad idea, worrying briefly about huge rabbit centaurs plaguing the countryside before coming to your senses. Surely it wouldn’t do something like that, would it? Either way, you are about to find out. Ophelia has already selected two subjects for her experiment, one male and one female, looking rather miserable in their chains.

                    “Down the hatch!” she grins, pouring the concoction down their throats. The effects are gradual, but both of the guinea pigs look like they have gained a fair amount of tone, their bodies athletic but not overtly bulging with muscles. A lush mane grows down their backs, disappearing just above their new long tails, the fine hairs smooth as silk. There is a subtle change in their faces too, the muzzle slightly longer and the nose a bit broader.

                    None of this seems to faze any of the three lagomorphs however, as their full attention is firmly fixed on the slowly rising monolith between the legs of the male. Most of the rabbits you’ve seen so far have had at least respectable members - especially considering their small stature - but this one is almost intimidating. It’s as thick as his arm, and long enough to reach his chin, looking almost comical on his slight frame. The poor bunny looks like he is about to pass out, though whether from shock or from the massive reallocation of blood to the veiny, flared monster between his legs isn’t clear. The air is heavy with his musk, spreading from the huge, overfilled scrotum at the base of his cock.

                    “Wow… that is… nice...” Ophelia stammers dreamily, still transfixed by the now fully erect majestic shaft. She is practically drooling, and it looks like she is preventing herself from throwing herself on it by sheer force of will. The female test subject, meanwhile, is prevented by the sheer force of metal chains, though it looks like the jury is still out on which of them will win the battle. The alchemist shakes her head, trying to clear it of sexual thoughts.

                    “H-however! Will that even… fit?” She looks worried for a moment, before brightening up. “Unless… girl! On all fours. Come on now, do you want to be fucked or not?” ${player.SubDom() < -30 ? ` You are halfway to your knees before it dawns on you that she is addressing the other bunny, not you. Slightly embarrassed - and maybe a little disappointed - you straighten back up, pretending nothing happened.` : ``}

                    The rabbit is panting with need, and eagerly obeys, begging for her restraints to be undone so she can throw herself at the magnificent horsecock. Ophelia circles the girl, pulling her long tail aside to expose her dripping pussy. The scientist carefully inserts two fingers into the folds of her test subject, followed by two more when she meets no resistance.

                    “Hey, ${pc.name}, have a look at this!” she calls out to you, simultaneously shoving her entire fist inside the bunny-girl. “She can take my entire forearm without even blinking!” Ophelia marvels at the girl’s flexible cunt, “I guess they are meant for each other.” There is a large visible bulge on the lagomorph’s stomach, yet she doesn’t seem to experience any pain or discomfort from the intruding limb, continuing to beg for the tantalizing equine dick just outside her reach. The alchemist pulls out her arm, releasing a waft of musk so heady it feels like a punch in the face. Almost instinctively, she gives the fluid a lick, shaking her head in confusion.${oph.hascock(` Her cock is straining against the fabric of her lab coat, aching to be buried in that sweet honeypot.`)}

                    The strong secretions reach the male lagomorph-equine hybrid, who groans almost as if in pain, thrashing against his bonds, his cock impossibly stiff and leaking pre like a broken faucet. The rest of the chained test subjects are also stirring, roused and aroused by the strong scents that now permeate the entire lab. Ophelia’s guards pick this moment to step inside to see what all the fuss is about, their jaws dropping in unison as they drink in the scene before them. As one, they jump toward the pair, overcome by their lust.

                    “I- uh, I got to take care of this,” Ophelia frets, vaguely waving a hand at the chaos unfolding behind her. You are not completely certain what she means by that, but she seems to have some plan, so you allow yourself to be ushered out of the lab.`);
                    Text.Flush();

                    Gui.NextPrompt(() => {
                        Text.Clear();
                        Text.Out(`<b>Some time later…</b>

                        An exhausted Ophelia waves you inside again, breathing heavily and slick with sweat. The room is in a state of disarray - more than usually, that is - and there are large amounts of unidentifiable fluids soaking into the ground. Except for a few wide-eyed, chained lagomorphs, the room is completely deserted.

                        “Well, that’s done,” the disheveled alchemist sighs, wavering slightly as she adjusts her glasses. There is more of the sticky stuff dripping from her hair and trickling down her inner thigh.

                        “I sent them off to a breeding chamber,” she answers your silent question. “There were a few… complications.” It doesn’t look like she wants to say anything more on the subject, so you leave it at that. Ophelia wordlessly hands you a bag of coins for your trouble.

                        <b>You receive 250 coins!</b>`);
                        Text.Flush();

                        party.coin += 250;
                        TimeStep({hour: 1});
                        burrows.flags.Equinium = 1;

                        OpheliaScenes.PotionsPrompt();
                    });
                }, enabled : party.Inv().QueryNum(AlchemyItems.Equinium) !== undefined,
                tooltip : `Introduce Equinium into the diet of the colony.`,
            });
        }

        Gui.SetButtonsFromList(options, true, OpheliaScenes.LabPrompt);
    }

    export function DeliverCactoids() {
        const player: Player = GAME().player;
        const party: Party = GAME().party;
        const burrows: Burrows = GAME().burrows;

        Text.Clear();
        Text.Out(`“Ah, nice!” Ophelia takes the squirming little creatures, handling them carefully in order to not get stung. You turn your head uncomfortably as she summarily salvages the ingredients she needs from the innocent critters before releasing them again.

        “Now, what were the other things I needed...” she muses, browsing through one of her scrolls. “Give me an hour or so, I need to try a few things.” You settle down to wait as the bunny-morph begins to mix the contents of various jars with the ground cactoid needles. After a while, you begin to space out, your gaze dropping down to Ophelia’s cute little butt as it scurries about - barely hidden under her short lab coat - her puffy tail bobbing with excitement.

        The alchemist curses a few times, brewing up new mixtures as the delicate balance of one of her solutions turns sour. Finally, she swirls around triumphantly, a bottle in hand containing a bubbly concoction with a garish green color.

        “This should do it!” she announces. “This should increase the bodily strength of the colony, making our soldiers sturdier! I’m sure daddy’ll like this one… just need to test it.” Motioning for you to follow, she hops over to the wall where her volunteers are held. Picking out one of the male lagomorphs, a rather scrawny fellow, she hands him the potion and instructs him to drink it.

        Giving the alchemist a look of absolute trust, the lagomorph accepts the bottle and downs it in one swig, the chains around his wrists clinking together at his enthusiasm. Silently, you hope that the liquid isn’t toxic. However, nothing could prepare you for the effects of the solution.

        A shock runs through the subject’s body, the bunny twitching from head to toe as the potion begins to take effect. He cries out as he begins to violently change, his muscles swelling rapidly, his body mass increasing to many times his former scrawny frame. The metal shackles around his wrists and ankles shatter as if they were made from twine, providing no resistance to the bulky bunny.

        Growing from his meager five feet to six, seven, passing eight feet in height and half that over his shoulders, the lagomorph looks nothing like his former self. Bulging, rippling muscles stretch over his chest, arms and legs. His face looks completely transformed; his brows sunken and his chin broad.

        The most impressive change to his physique, however, lies between his powerful thighs. A bobbing third leg, almost three feet in length and several inches thick, looms like a monument to the bunny’s newfound masculinity. A pair of balls the size of coconuts hang beneath it, swollen with seed.

        This last change doesn’t seem to have gone unnoticed by the other volunteers; their gazes are entranced by the monstrous shaft, their mouths watering as globs of pre-cum form on the bulbous tip. Looking in wonder at his new body, the brute doesn’t seem to have missed the attention he’s receiving either.

        “Did you see that?” Ophelia pipes at your shoulder, peeking out behind you. “Quite impressive reaction, I’d say!” She frowns as the hulking lagomorph sways his gaze around, fixating on one of the female bunnies.

        “Hey, you big lump, are you listening?” the alchemist yips, pouting as the brute ignores her. Instead, he chooses to bodily pick up his fellow test subject, absently breaking her bonds without effort. With a vapid broad smile on his face, the bulky jock cradles the female, placing her astride his erect battering ram. The smaller bunny blushes, her cheeks aflame with arousal. Rivulets of sweet femcum lather the thick pole, her body instinctively preparing to be taken by the powerful male.

        “Well, those parts certainly seem to be working,” Ophelia huffs, a slight flush on her cheeks. The brute is surprisingly gentle as he caresses his smaller lover; massaging her pert breasts and fondling her hair with fists the size of her head. With nothing else to support her, the girl is suspended by nothing more than the enormous cock, the male’s arousal seemingly more than enough to uphold her slight frame. “E-even bigger than father’s… will it even be able to fit?” Though she seems a bit skeptical, Ophelia scrambles to get hold of her notepad, her eyes never leaving her test subjects.

        “Initial penetration… problematic,” she murmurs beneath her breath as she starts scribbling notes. It’s like she says; even with her snatch wet like an ocean, the bunnygirl has trouble stretching far enough to allow the brute to enter her. After several failed tries, the frustrated jock lifts her up by the waist, bringing his broad tongue to her crotch. His lover relaxes with a shudder, allowing him to ease her folds apart, preparing her for what’s to come.

        “Interesting technique,” Ophelia notes, her breath coming short. Glancing down, you see that she’s placed her pad on a table in front of her, writing notes growing scrawlier by the minute as her other hand busies itself under her lab coat. Even a rabbit as smart as she can’t escape her true nature.

        Eager to give it another go, the bulky bunny gets down on his back, motioning for his partner to take a seat on his towering member. She straddles him, her pussylips hesitantly kissing the magnificent pole as she hovers above it. The poor girl has to stand on her tiptoes to even reach the ground, so big is it. Gulping down the last remains of her lingering doubt, the bunny surrenders to her lusts, sinking down on the massive shaft. Her cunt is stretched impossibly wide by the sheer girth of her lover, but by the sound of her ecstatic cries, she’s far from complaining. It’s physically impossible for her to take all of her lover - but you don’t suspect that the bunnies are particularly good at physics. Either way, they both seem more than willing to try as the girl impales herself deeper with each downward thrust.

        Unable to help himself, the brute starts to rock his hips, mercilessly pounding his monstrous cock into the delirious girl. His initial composed demeanor seems to be eroding by the second as the potion affects not only his body, but also his mind.

        “I’d say a more... in depth study is needed,” the alchemist murmurs, biting her lip as she watches the coupling intently. By now, she’s given up even the semblance of taking notes, reclining on a bench beside you with her coat open, her fingers busy probing her wet snatch.

        You can feel heat rising in your own body, the urge to join in… and what? Help Ophelia? Or take your own turn at riding this immense monolith of lagomorph meat? Either way, your musings are cut short by the brute’s sudden climactic eruption, his gigantic orgasm all but blasting his lover several feet into the air - though not before filling her womb to the brim with his thick seed.

        Both you and Ophelia are stunned by the display, the alchemist absently wiping a stray glob of cum blasted across the room from her cheek. Sucking on her finger thoughtfully, she studies her partially soiled notes, adding: “Final verdict: promising. Warrants further experimentation.”

        The other test subjects perk up at this, eager to be helpful.`);
        Text.Flush();

        party.Inv().RemoveItem(QuestItems.Cactoid, 3);

        TimeStep({hour: 1});

        burrows.flags.BruteTrait = BurrowsFlags.TraitFlags.Active;

        Gui.NextPrompt(() => {
            OpheliaScenes.DeliverFollowup(BurrowsFlags.Traits.Brute);
        });
    }

    export function DeliverGolHusks() {
        const player: Player = GAME().player;
        const party: Party = GAME().party;
        const burrows: Burrows = GAME().burrows;

        Text.Clear();
        Text.Out(`“I hope you didn’t have any trouble finding these.” Ophelia quickly relieves you of the husks, bringing them over to her workbench. “Gols can be terribly ferocious, I’ve heard. Very territorial.”

        The alchemist cracks open one of the carapaces, carefully grinding it into fine dust. You settle down to watch her work, occasionally handing her a jar or bottle that she requests. She seems to be enjoying this line of work, cracking a triumphant smile as the mixture changes in hue and consistency under her deft care. It’s a while later when she finally twirls around, grinning as she brandishes her accomplishment.

        “All done!” she proclaims, holding the clear bottle up toward the light.

        What does it do?

        “Frankly, I have no idea. The scroll was a little vague. Why don’t we find out?” Not waiting on your response, Ophelia strides over to her volunteers, calling for their attention.

        “Who wants to prove themselves for Lagon, perhaps gain his favor?” The chained rabbits clamor for attention, one of the females hopping to the front and opening her mouth expectantly.

        “Very well, you shall be the first test subject!” The alchemist hands the eager girl the bottle, ruffling her hair while she greedily drinks it up. Nothing seems to happen at first, but the bunny suddenly flops over, hugging herself as she moans in delirious pleasure. Her fellow captives gather around in concern, blocking your view, and Ophelia shoves them away again, adjusting her glasses in annoyance. “So, how do you feel?” she asks the bunny, readying her pen.

        Her ears still twitching and her face flushed, the lagomorph pulls herself up to her knees, hands covering her crotch. You look her over - a pretty little thing, to be sure - but the potion doesn’t seem to have had any obvious effects. Ophelia taps her hip impatiently. “Come on now, don’t be shy.”

        The aroused bunny squirms, gulping nervously as she removes her hands and reveals her newly grown cock. It’s no monster, jutting out just above her pussy at a modest five inches, but it nonetheless looks out of place on her.

        “Now this is interesting!” Ophelia exclaims, prodding the stiff rod with her pen, enticing a soft moan and a spurt of thick pre from the test subject. Curious, since the transformation apparently didn’t make her grow any balls. Smiling sweetly, the alchemist turns to one of the male volunteers, wagging another bottle of the mixture in front of him. “You’re next!”

        His eyes droop, but he accepts the mixture, downing it in one swig. You watch curiously, wondering what effects this concoction will have on a jock. You aren’t disappointed; if anything, the changes are all the more apparent on the male than it was on the female. That, and this time Ophelia is certain that the effects aren’t hidden by any naughty bunny paws.

        Not that the unfortunate rabbit would have much luck hiding the changes to his body. Like most males of his race, the jock is lithe and athletic, and he expresses some concern as he begins to fill out - a little here, a little there, a broadening and rounding of the hips and thighs, a swelling of the butt. Interesting things are happening to the bunny’s chest too - a pair of modest breasts rising from his former flatness.

        By now, <i>her</i> would probably be a better way to address the lagomorph. The former male’s balls recede into his crotch, forming a thin gash just below the base of his quivering cock. The transformed bunny gives out a yelp - significantly higher in pitch than before - as Ophelia gives her newly formed pussy an experimental touch. “Not quite what I expected, I must admit,” the alchemist confesses, jotting down a few more notes in her pad.

        The two recently freed and very much aroused test subjects waste no time in throwing themselves at each other, eager to test out their respective new equipment. Ophelia gives them a few rounds to let off steam, before rolling her eyes and pulling one of them away.

        “I need to have something to show daddy, don’t I?” she answers the bunny’s accusatory stare. She turns back to the other volunteer - you are not quite sure which one, male or female. “I… I’m sure the others can help you out. It should go soft if you do it a few more times. I think.” The herm doesn’t seem to be complaining, quickly finding a group of her siblings to fuck and be fucked by.`);
        Text.Flush();

        party.Inv().RemoveItem(QuestItems.GolHusk, 3);

        TimeStep({hour: 1});

        burrows.flags.HermTrait = BurrowsFlags.TraitFlags.Active;

        Gui.NextPrompt(() => {
            OpheliaScenes.DeliverFollowup(BurrowsFlags.Traits.Herm);
        });
    }

    export function DeliverAlgae() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const party: Party = GAME().party;
        const burrows: Burrows = GAME().burrows;

        Text.Clear();
        Text.Out(`“Very good, ${pc.name}! I have great hopes for this one!” Ophelia seems unusually animated as she takes the plants from you, bringing them over to her workbench. You settle down and she begins chopping them into thin strands, putting them into a pot of boiling water. The alchemist goes on to explain that this particular scroll - she waves it in the air enthusiastically - suggests that it describes a potion that sharpen one’s senses.

        “I’m not sure if you’ve caught on to it, but most of my siblings aren’t very bright. Enthusiastic, certainly,” she hurries to defend them, “but not the most stimulating conversationalists. They prefer different kinds of stimulation.” The bespectacled bunny sighs, absentmindedly stirring the contents of the pot. “I used to be able to talk to mother… before she changed.” Her ears droop with sadness, before she cheers herself up again.

        “Who knows, this might bring her back!” she adds optimistically. You’re a bit more skeptical; having met Vena, you doubt that a mere potion will be enough to bring her back from the depths of perverse decadence she wallows in.

        Ophelia seems hopeful to the contrary at least, and hums to herself quietly as she prepares the potion, fidgeting with excitement even as she waits for the mixture to reach the correct temperature. Finally, after double-checking everything with the scroll again, she seems to be happy with the results.

        “You!” she exclaims, pointing out one of the female volunteers. Brimming with excitement, Ophelia frees the bunny from her chains, leading her over to the workbench and offering her a seat. “Drink,” the alchemist instructs, watching intently as her little sister chugs the potion, holding the bottle in both hands. The bunny gives a small hiccup, but there doesn’t seem to be any other effects. She looks about herself in confusion.

        “How… do you feel?” Ophelia asks apprehensively.

        “G-good, I think?” the girl scratches her head in confusion. “I feel… weird. The words just come tumbling into my head, like a waterfall.” She focuses on her sister. “Ophelia? What did that potion contain?”

        The alchemist lets out a delighted woop, hugging the bunny close. “It worked, ${pc.name}!” she exclaims. “We need to show this to father, I’m sure he’ll find this useful!”

        You still have your doubts. While the lagomorph certainly seems more articulate than before, her mind seems to wander easily. Ophelia tries to show her a few books, but she seems more interested in returning to her fellow volunteers and fuck them. Can’t win every battle, you suppose.`);
        Text.Flush();

        party.Inv().RemoveItem(QuestItems.RedAlgae, 3);

        TimeStep({hour: 1});

        burrows.flags.BrainyTrait = BurrowsFlags.TraitFlags.Active;

        Gui.NextPrompt(() => {
            OpheliaScenes.DeliverFollowup(BurrowsFlags.Traits.Brainy);
        });
    }

    export function DeliverFollowup(trait: number) {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const party: Party = GAME().party;
        const lagon: Lagon = GAME().lagon;
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        party.location = WORLD().loc.Burrows.Pit;

        Text.Clear();
        Text.Out(`“Thank you for gathering the ingredients for me,” Ophelia nods, satisfied with the results of her new concoction. She fills a large bottle with the substance, adjusting her glasses and smoothing out her lab coat before turning back to you.`);
        Text.NL();

        if (burrows.flags.Access < BurrowsFlags.AccessFlags.Stage1) {
            burrows.flags.Access = BurrowsFlags.AccessFlags.Stage1;

            Text.Out(`“We should take this to father right away, I know he’ll love this!” You have your reservations, but you are interested in the payment offered, so you follow behind the excited bunny. Once in the tunnels, the guards silently close in around you, escorting you toward Lagon’s throne room.

            The ruler of the burrows seems a tad busy, grunting as he drives himself balls deep into a pretty little lagomorph, impaling her on his massive meatstick. She is moaning incoherently, driven to her limits as her body is wracked by a shattering orgasm - and by the envious looks of Lagon’s harem, it’s far from her first. They keep their voices lowered respectfully, though many can’t resist touching themselves, whimpering quietly as they imagine themselves prone under their mighty leader. Lagon grits his teeth, tensing as he pours his hot seed inside of his latest fucktoy, no doubt impregnating the girl. Her stomach bloats slightly as her womb is filled to the brim, the excess dripping down between her thighs. She passes out, the intense experience finally too much for her.

            At last, Lagon notices your arrival. Nonchalantly, he pulls the senseless rabbit off his still erect member, studying you curiously as he deposits her on the floor. A few gallant youths hop forth quickly, taking care of the poor girl - though their lustful gazes and bobbing cocks make you doubt their chivalrous intentions.

            “To what do I owe the pleasure of my daughter’s presence?” the patriarch drawls, eyeing you in passing. “If you want a fuck, you’ll have to get in line.” He mockingly gestures at the needy females surrounding his throne on their knees, each begging to be his next bitch.

            “N-not now, father,” Ophelia blushes, her eyes flitting over to you for a second. “I-I finished it, with the help of ${pc.name} here! I finished the potion!” Excited, she goes on to describe the effects of the new solution, proudly presenting her test subject to him. Lagon’s eyes are unreadable as he studies the flask.

            “And how much of this do you think you can make?”

            “I can probably produce two or three flasks of that size in a day… provided I can get more raw materials. I used up most of it making this. Maybe a little more, once I get the process down.”

            “What, do you expect our resourceful friend to slaughter monsters for you all day long? You must be offering ${pc.mfFem(`him`, `her`)} quite the favors for such diligence.” Lagon laughs at his colorful joke, enjoying his daughter’s discomfort.

            “Never mind that, I have a far more… efficient solution.” With that, he hops out of his throne, leading the way out of the chamber, flask in hand. Ophelia shrugs at you, setting out after her father, her guards in tow. Before long, the rhythmic drone makes it apparent that you are heading toward the Pit, the large breeding cavern at the center of the colony. On all sides, the participants of the perpetual orgy quiet down as their leader walks among them. A worshipful silence fills the huge space as the entire room focuses intently on your small group, paused mid-coitus.

            “...Father? What is going on?” Ophelia asks in a small voice, perhaps already suspecting where this is headed. “I… I have plenty of test subjects in the pens of my lab, there is no need-”

            “Shut it,” Lagon growls, “you said it yourself, didn’t you? You only have enough to mutate a few measly runts with this. My method only needs one large dose.” He comes to a halt in front of the great matriarch of the lagomorphs, Vena. The matron looks confused, her fractured and clouded mind not grasping why no one is fucking her.

            “Vena,” Lagon says, almost fondly, “do you recognize the face of your master?”

            “La-gon.” Her voice is stuttering at first, before becoming more sure. “Lagon. Husband.” She looks down at him curiously, actually blushing a bit. “We… breed?”

            “I’ll fuck you senseless just like you want, but first… this!” The wiry rabbit smoothly hops up, straddling the aroused matriarch’s chest, planting his cock in the valley between her enormous breasts. When she instinctively opens her maw, seeking to envelop the thick treat presented to her, Lagon instead forces the neck of the glass flask between her lips.

            “Just drink up, girl,” he murmurs, pouring the volatile substance down her throat. Vena has little choice but to swallow the potion, chugging down a dose at least three times the amount that Ophelia subjected her guinea pig to.`);

            OpheliaScenes.DeliverVena(trait);
        } else if (burrows.flags.Access < BurrowsFlags.AccessFlags.Stage2) {
            burrows.flags.Access = BurrowsFlags.AccessFlags.Stage2;

            Text.Out(`Ophelia thoughtfully pours the rest of the brew into a larger flask. She squares her shoulders, looking determined. “Shall we? I have a thing or two I wish to talk with father about.” With that, you set out toward the throne room, guards in tow. For once Lagon isn’t fucking someone, instead merely reclining on his throne, munching on some snacks.

            “Father, I’ve finished another potion.” The lagomorph scientist trots out her morphed test subject, dejectedly showcasing the mutations that her latest concoction causes. Lagon nods, studying his daughter closely.

            “Something on your mind, girl?” he asks when she’s finished, noting her reluctance. “Speak up.”

            “I-It’s just…” she stutters, “I did some experiments earlier, I’ve really improved, I think this one could be produced at a larger scale, perhaps if I had more assistants-” With each word, Lagon’s countenance sours, until his face is a mask of barely contained anger.

            “Enough!” he snaps, silencing Ophelia. “You have a problem with my way of doing things? I have no interest in your opinions, and I could find <b>far</b> better use for that mouth of yours. We will do it the same way as last time.”

            For a moment, it looks like Ophelia will back down, but she gathers her courage and pushes on, a slightly wild look in her eyes. “B-but what about mother? What if there are side effects of so many different chemicals, do you not care for-”

            “Silence.” He was angry before, but now he looks closer to a cold, calculated rage. “Why would I care about that slut? She is only one among many. I’ve said it before,” he growls, getting up and stalking closer to the two of you, “anyone here is mine to take as I please. <b>Anyone.</b>” His face is inches from the frightened alchemist, looming above her threateningly.

            “You don’t want to cross me, daughter.”`);
            Text.Flush();

            WatchedOphelia = false;

            // [Stop him][Divert][Watch]
            const options: IChoice[] = [];
            options.push({ nameStr : `Stop him`,
                func() {
                    Text.Clear();
                    Text.Out(`This has gone far enough. You pull Ophelia back from her enraged father, wrapping a protective arm around her as you face down with Lagon. At first, he looks incredulous, but his face quickly turns unreadable.

                    “I will be lenient this once, as you are not familiar with our ways.” Each word is spoken through gritted teeth, his seething rage barely held in check. “Never cross me again, or, outsider or no, you’ll feel my wrath.” With that, he turns away, leading the way toward the Pit again. Guards close in behind you, prodding you and Ophelia to follow with the butts of their spears.

                    “T-thank you,” the frightened rabbit whispers to you.`);

                    lagon.relation.DecreaseStat(-100, 25);
                    ophelia.relation.IncreaseStat(100, 25);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `Stand up for her.`,
            });
            options.push({ nameStr : `Divert`,
                func() {
                    Text.Clear();
                    Text.Out(`The situation is quickly heading down the drains, and you hurriedly suggest that you should all head for the Pit, to see the effects of the new potion. Lagon studies your face, barely keeping his rage in check. He nods slowly.

                    “Yes, I think we will do just that.” He grabs Ophelia by the scruff of her neck, dragging her along. You follow behind them closely, glad to have at least mostly prevented the alchemist from getting harmed.`);

                    lagon.relation.DecreaseStat(-100, 5);
                    ophelia.relation.IncreaseStat(100, 10);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `Step in before something ugly happens.`,
            });
            options.push({ nameStr : `Watch`,
                func() {
                    WatchedOphelia = true;
                    Text.Clear();
                    Text.Out(`You watch in silence as father and daughter lock gazes. She holds out for a short while, but after a few moments, she sullenly looks down, admitting defeat.

                    “Don’t think you’ll get off the hook that easily,” Lagon growls, grabbing hold of her jaw, forcing it open. “A bad girl like you needs to be punished...” He studies her pained expression as she struggles weakly against his iron grip.

                    “Perhaps you are right, maybe I shouldn’t use Vena anymore. Perhaps you’d like to take her place? A mindless breeding slut, being fucked and impregnated day in and day out, is that the kind of life you yearn for?” The lagomorph patriarch pries the alchemical draught from Ophelia’s hands, forcing it to her unwilling lips. “Would you like to start right now?”

                    She shakes her head vehemently, and he relents, handing the bottle to you. “In that case, your punishment has to be something... different.” Under Lagon’s directions, Ophelia lies down on her back, opening her stained lab coat and spreading her legs wide. The larger male wastes no time on foreplay, soaking his stiff shaft in his daughter’s wet cunt before adjusting his aim, placing the head of his giant cock against Ophelia’s tight rosebud.

                    There is no love in his ruthless fucking, just a cruel, animalistic lust and the assertion of dominance. Gradually, the girl’s cries of pain turn to pleading, begging for him to finish. His point made, he increases his pace, roaring as he deposits his load in her.

                    “Now, we have work to do.” Without further ado, cock still dripping spunk, Lagon heads off, forcing you to keep up. Ophelia pulls up beside you, tugging her coat tightly around herself, avoiding looking in your direction. You trudge along in silence, feeling uncomfortable with yourself.`);

                    lagon.relation.IncreaseStat(100, 5);
                    ophelia.relation.DecreaseStat(-100, 25);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `It’s not worth sticking your neck out for. What is she to you, after all?`,
            });
            Gui.SetButtonsFromList(options, false, undefined);

            Gui.Callstack.push(() => {
                Text.NL();
                Text.Out(`Before long, you’ve reached the large breeding cavern. The heat here is palpable, and a thick musk permeates the air, despite the gathered rabbits gradually quieting down in the presence of their master. Lagon ignores the pleading and groveling sex-crazed peons, heading straight for Vena.

                “I have another treat for you, my dear,” he grins maliciously, presenting the matriarch with the large flask. Lithely, he springs up on her chest, pouring the volatile fluids down Vena’s gaping maw.`);

                OpheliaScenes.DeliverVena(trait);
            });
        } else if (burrows.flags.Access < BurrowsFlags.AccessFlags.Stage3) {
            burrows.flags.Access = BurrowsFlags.AccessFlags.Stage3;

            Text.Out(`“Well… let's go see father.” Ophelia looks a little scared, no doubt reluctant since her last encounter with Lagon, but not daring to disobey him. The two of you head toward the throne room, successful test subject and guard troop in tow. The alchemist looks morose, constantly fidgeting and adjusting her glasses nervously.

            After trodding along in silence, you reach the large royal chamber where Lagon holds court. The ruler of the burrows seems to be busy, balls deep inside a pretty little thing, a girl who looks like she could be Ophelia’s younger sister. Upon further consideration, she probably is.

            “What do you have for me this time, my nerdy little slut?” Lagon greets his daughter, grunting slightly as he rewards his lover with a fat sticky wad of cum. He gives her a slap on her butt as she awkwardly stumbles away with her hands between her legs, trying to prevent the semen from leaking out of her gaping cunt.

            “I have a new potion for you, father,” Ophelia explains demurely, waving for the test subject to be brought forth. He nods appreciatively, satisfied with the results of her research. “No arguments today?”

            “...No.” Ophelia bites her lip, sullenly hopping up beside you as all of you head toward the Pit. Lagon seems to be in a good mood for once, smirking to himself as he walks along briskly. You feel distinctly uncomfortable, walking down the vast cavern with the eyes of hundreds of horny rabbits focused on you, though the leader of the colony pays them no mind. Lagon has his subjects clear a space for your party at the center of the Pit, just next to where Vena is.

            “Come, girl.” He waves Ophelia to his side. “Why don’t we go visit your mother?” She follows him uncertainly, suspicious about his sudden joviality. She goes to the prone matriarch, pulling the woman’s lush hair from her clouded eyes.

            “I thought I’d give you the honors,” Lagon grasps her shoulder, handing her the bottle. He has one of his feet planted squarely on Vena’s chest, looming over the pair. Ophelia gulps, tears in her eyes as she feeds the final draft to her mother with trembling hands. “Good girl, now wait over there.” The alchemist hurriedly joins your side, watching anxiously as the effects begin to take hold.`);

            OpheliaScenes.DeliverVena(trait);
        } else {
            Text.Out(`<b>THIS IS A BUG. Burrows flag: ${burrows.flags.Access}.</b>`);
            Text.Flush();
            Gui.NextPrompt();
        }
    }

    export function DeliverVena(trait: number) {
        const burrows: Burrows = GAME().burrows;

        Text.NL();
        if (trait === BurrowsFlags.Traits.Brute) {
            Text.Out(`Just like with the test subject, the effects on Vena are immediate, if not quite as violent. All her limbs grow thicker, longer, filling out with muscle. It looks like she is gaining a good few feet on her already large frame. She looks much more athletic, her features toned but not overly bulging.`);
            Text.NL();
            if (burrows.HermActive()) {
                Text.Out(`...Except, that is, for the third leg between her thighs. With this additional mutation, Vena’s cock has grown to an almost ridiculous size, at least two feet long and thick as an arm.`);
                Text.NL();
            }
            Text.Out(`The matriarch flexes experimentally, trying out the reach of her enlarged limbs, hesitantly touching the significantly more defined muscles on her arm.

            “Birth me many strong sons and daughters,” Lagon murmurs.`);
            if (burrows.HermActive()) {
                Text.Out(` He is eyeing her immense member almost nervously, perhaps a bit intimidated by her size.`);
            }
            if (burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage3) {
                Text.Out(` “This is going to be interesting,” Lagon chuckles, grinning maliciously.`);
            }
        } else if (trait === BurrowsFlags.Traits.Herm) {
            Text.Out(`“Going to be interesting to see the effects of this one, it should make things… more efficient.” Lagon chuckles as Vena squirms, crossing her legs feebly as unfamiliar feelings race through her body, focusing to a pinpoint on her clit. The matriarch cries out in surprise as the sensitive organ begins to grow rapidly, gaining inch upon inch and thickening significantly. The bulging new shaft is about nine inches when a cumslit forms on the head, squirting thick white fluids into the air.

            In the place of her clit stands a girthy rod that would put most men to shame, swollen in the middle and throbbing slightly as thick rivulets of girl-cum ooze down its length, making the mouths of every female in close vicinity water. It is clear that the matriarch is going to have even more rabbits vying for her attentions from now on.`);
            Text.NL();
            if (burrows.BruteActive()) {
                Text.Out(`Her transformation has barely begun, however, as Vena’s other mutations kick in, her increased body mass reflecting itself on her new organ. Before the massive shaft has finally stopped growing, it is over two feet long and as thick as an arm.`);
                Text.NL();
            }
            Text.Out(`Vena looks almost exhausted, but her erection shows no signs of diminishing.`);
            if (burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage3) {
                Text.Out(` “Haha, this will be fun!” Lagon gloats, grinning maliciously.`);
            }
        } else if (trait === BurrowsFlags.Traits.Brainy) {
            Text.Out(`Vena’s eyes flutter shut, her hands clutching her head as sparks of intelligence try to break the surface of her shattered mind. For a brief moment, she almost looks lucid, before her eyes are once again clouded by lust.

            “Are you really too far gone, mother?” Ophelia murmurs sadly, crestfallen to see how little effect even such a powerful dose had. Lagon just shrugs, more concerned with what effect the drug will have on her children than on the woman herself.`);

            if (burrows.flags.Access >= BurrowsFlags.AccessFlags.Stage3) {
                Text.NL();
                Text.Out(`Vena shudders as a wave of arousal courses through her body, triggered by her new mutations. In no time, her immense cock is at full mast, eager to bury itself in some needy cunt.

                “Ah, perfect timing,” Lagon gloats, smiling maliciously.`);
            }
        }
        Text.Flush();

        Gui.NextPrompt(OpheliaScenes.Reward);
    }

    export function Reward() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const party: Party = GAME().party;
        const terry: Terry = GAME().terry;
        const miranda: Miranda = GAME().miranda;
        const kiakai: Kiakai = GAME().kiakai;
        const vena: Vena = GAME().vena;
        const ophelia: Ophelia = GAME().ophelia;
        const burrows: Burrows = GAME().burrows;

        rewardSexFlag = false;

        Text.Clear();
        if (burrows.flags.Access <= BurrowsFlags.AccessFlags.Stage1) {
            Text.Out(`“And there you have it, the strain will spread,” Lagon announces, looking pleased with himself. “All that is needed now is breeding, but you are good at that, aren’t you Vena?” He pats the broodmother’s swollen belly fondly. For a moment, it looks like he is about to withdraw his hand, but instead his fondling turns more intimate, caressing Vena’s ${burrows.BruteActive() ? `toned` : `soft`} fur as his fingers trail toward her crotch.`);
            Text.NL();
            if (burrows.HermActive()) {
                Text.Out(`There is a moment of hesitation before he closes his paw around the matriarch’s new veined appendage, stroking it curiously. Vena cries out in ecstasy as her engorged clit is pleasured for the first time, unleashing a veritable geyser of cum as she orgasms from her lover’s touch.

                “Seems to be working just fine,” Lagon comments, before he changes the target of his affections.`);
                Text.NL();
            }
            Text.Out(`“It was a day or two since I fucked you last, wasn’t it? Have you been pining for your alpha, little slut?” The rabbit grins as he roughly shoves his thick fingers into Vena’s accommodating cunt, loosened by unceasing use.`);
            Text.NL();
            if (burrows.BrainyActive()) {
                Text.Out(`“Copulate with me, oh master!” the matriarch cries out, grinding against Lagon’s hand. The lagomorph king looks slightly puzzled at her sudden eloquence, but he is quick to heed her call.`);
            } else {
                Text.Out(`“B-breed me!” the matriarch cries out, grinding against Lagon’s hand.`);
            }
            Text.Out(` Withdrawing his finger from her dripping snatch, the horny male positions his throbbing erection at her entrance.

            “As my lady wishes,” he responds amiably, pushing inside her welcoming folds. Vena moans in ecstasy as her mate relentlessly pounds her, driving his footlong cock into her like a jackhammer. There is an almost feral energy to his lovemaking, and you realize that only with the resilient matriarch can he truly go all out without permanently damaging his partner.

            The orgy starts to pick up again around you as the sight of Vena being bred is too much for the simple rabbits to keep back their lust. Beside you, Ophelia is fiddling with her hair and glasses, gaze flitting everywhere but at her rutting parents. Her emotions are mixed to say the least, worry and disgust mixing with a minute hint of envy on her face. You decide that this perhaps isn’t the best time to talk to her.

            Once he has finished with Vena, pumping his potent load inside the breeding slut, Lagon gives her a final caress before pulling out and hopping over to you. Telling you to follow, he heads back toward the throne room, cock still dripping cum. You catch one last glimpse of the pregnant matriarch before you leave the chamber. Seems like she isn’t getting much rest as she’s already swarmed by curious lagomorphs, eager to see how her body has changed.

            “Tell me, what would you like for your reward, my dutiful servant?” the king asks you, smoothly jumping into a slouch on his throne, his still half-erect member on full display. “I can offer you some of Ophelia’s fine stock.” He lays a set of vials out in front of you.`);
            Text.NL();

            Gui.Callstack.push(() => {
                Text.NL();
                Text.Out(`“There are still more to gather from the world outside. Bring the ingredients that Ophelia needs and you shall be richly rewarded.” With that, Lagon dismisses you. Ophelia disappears down a tunnel before you have a chance to talk with her more, probably heading back to her lab.`);
                Text.Flush();

                Gui.NextPrompt();
            });

            OpheliaScenes.RewardChoices();
        } else if (burrows.flags.Access <= BurrowsFlags.AccessFlags.Stage2) {
            Text.Out(`“Very good, my girl,” Lagon encourages Vena, scratching the panting matriarch behind her ear. “Breed me many children, my dear, be a good slut for your master.”`);
            Text.NL();
            if (burrows.BrainyActive()) {
                Text.Out(`“As you command, my lord, I will be a good slut!” she moans weakly, rubbing her bloated stomach.`);
            } else {
                Text.Out(`“V-Vena is good slut!” she moans weakly, rubbing her bloated stomach.`);
            }
            Text.NL();
            Text.Out(`Lagon jumps down from atop the huge woman, motioning for you to join him as he heads back toward the throne room. Ophelia walks beside you without saying a word. Once you are back, the king of the rabbits jumps onto his throne, slouching arrogantly as he waves for some of his subordinates to bring him some refreshments.

            “Once again, you have done me good service. What do you wish as your reward this time, traveler? I can offer you some of Ophelia’s fine stock.” He lays out a set of vials in front of you.`);
            Text.NL();

            Gui.Callstack.push(() => {
                Text.NL();
                Text.Out(`“Hold,” Lagon calls out sharply as Ophelia begins to withdraw from the room. The alchemist sullenly turns back, bowing her head deferentially.

                “Now is not the time to have second thoughts, Ophelia. You will keep making new potions, or you will face my wrath,” Lagon states, dismissing the two of you. You leave together with Ophelia, walking beside her back to her lab. What do you tell her?`);
                Text.Flush();

                OpheliaScenes.RewardAftermathStage2Prompt();

                Gui.Callstack.push(() => {
                    Text.NL();
                    Text.Out(`The alchemist waves off any further conversation as you reach the lab. “Look… just keep bringing me those ingredients,” Ophelia tells you, deep in thought. “I might have an idea...”

                    You are not quite sure what she is plotting; considering her mood, you doubt it bodes well for anyone, least of all her father.`);
                    Text.Flush();

                    party.location = WORLD().loc.Burrows.Lab;

                    Gui.NextPrompt();
                });
            });

            OpheliaScenes.RewardChoices();
        } else {
            Text.Out(`“Ah, you are so pretty, my perfect little breeding slut.” Lagon strokes Vena’s cheek fondly. “Come over here daughter, this is all your work after all. Vena is so grateful for all that you have done for her. In fact...” As Ophelia edges closer uncertainly, Lagon moves his hand to the matriarch’s immense clit-cock. “In fact… she is <b>very</b> grateful, and she would like to show you her appreciation...”

            The alchemist is rooted where she stands, unsure if she should fight or flee. Lagon whispers something in Vena’s ear, enticing the herm matriarch with sweet words. Suddenly, she springs up, a bit unsteady on her feet from her swollen belly. She is clearly addled with lust, her eyes clouded as they sway every which way before focusing on her daughter.

            “Ophelia… my dear daughter,” the lusty herm breathes, taking a step toward the alchemist. “You are so beautiful… will you give your mother a hug?” It is clear from her bobbing cock that she intends to do far more than ‘hug’ the smaller female. Looking afraid, Ophelia takes a wavering step back, but her foot slips on the cum-stained ground, and she lands on her back. Heedless of her fall, Vena stalks toward her daughter, eyes burning with lust.

            Behind her, Lagon stands with his arms crossed over his chest, grinning at the scene before him. The alchemist looks like she is about to fall prey to her mind-broken mother. What do you do?`);
            Text.Flush();

            fuckedByVena = false;
            stoppedVena  = false;

            // [Stop Vena][Watch][Offer][Attack]
            const options: IChoice[] = [];
            options.push({ nameStr : `Stop Vena`,
                func() {
                    stoppedVena = true;

                    Text.Clear();
                    Text.Out(`With a determined look on your face, you spring toward the giant lagomorph, aiming to put yourself in her path. Before you have taken more than three steps, however, there is a blur of white fur, and a stunning pain as Lagon’s foot connects with your temple. You are hurled face-down to the ground, and swiftly immobilized by the rabbit king.

                    “Now, let's not do anything rash here,” he grunts, securing your arms. For such a small creature, he is amazingly strong, and he holds you in place without apparent effort. “Just sit back and enjoy the show.” You bite back an angry retort; opening your mouth would only let in the turgid accumulated cum that coats the floor of the cavern.`);
                    Text.NL();

                    // Set hp to 1
                    player.AddHPFraction(-1);
                    player.AddHPAbs(1);

                    OpheliaScenes.WatchVenaEntry();
                }, enabled : true,
                tooltip : `Stop Vena by force before she throws herself on Ophelia.`,
            });
            options.push({ nameStr : `Watch`,
                func() {
                    Text.Clear();
                    Text.Out(`A quick glance in Lagon’s direction tells you that he is watching your every move carefully, taut muscles ready to spring should you rush to the alchemist’s aid. He acknowledges you coyly with a malicious grin, daring you to act.

                    “Wise choice,” he comments, chuckling as you fold your arms across your chest.`);
                    Text.NL();

                    OpheliaScenes.WatchVenaEntry();
                }, enabled : true,
                tooltip : `Just watch by the sidelines, trying to keep an eye on Lagon.`,
            });
            let tooltip = `Take Ophelia’s place - offer yourself to be bred by Vena.`;
            if (player.sexlevel < 5) {
                tooltip += ` You are not sure you’ll be able to take it, but you can’t just let the alchemist be raped in front of your eyes.`;
            }
            options.push({ nameStr : `Offer`,
                func() {
                    Text.Clear();
                    fuckedByVena = true;

                    vena.flags.Sex |= VenaFlags.Sex.FuckedBy;
                    vena.flags.Sex |= VenaFlags.Sex.Forced;

                    Text.Out(`You shout for her to wait, to take you instead, tearing off your gear quickly. Vena’s clouded gaze flits between you and her daughter in confusion, torn between the initial target of her lust and the new, willing slut presenting ${pc.mfFem(`him`, `her`)}self. After a brief moment of indecision, she jumps you, nearly crushing you with her weight.

                    “P-please, you don’t have to do this for me!” Ophelia pleads with you, trying to pull you out from under her panting mother. You grunt that you’ll be fine, though faced with the massive girth of Vena’s member, you aren’t so sure of that yourself anymore. Perhaps this was a bad idea...

                    “Hah, this is an unexpected treat!” Lagon strides over to the three of you, grinning sadistically as he plants a hearty slap on Vena’s butt, causing the matriarch to grind against you. “The noble hero saves the fair princess, was that your intention?” The king puts a possessive arm around his daughter’s shoulders. “Too bad that isn’t how this is going to work out.”`);
                    Text.NL();

                    let target = BodyPartType.ass;
                    let cap = player.Butt().capacity.Get();
                    let targetDesc: CallableFunction;
                    if (player.FirstVag()) {
                        target = BodyPartType.vagina;
                        cap = player.FirstVag().capacity.Get();
                        targetDesc = () => player.FirstVag().Short();
                    } else {
                        targetDesc = () => player.Butt().AnalShort();
                    }

                    if (cap < 60) {
                        Text.Out(`“Here, take this, ${pc.name},” Ophelia whispers to you, eyeing her mother’s two-foot member as she slips a small pill into your mouth. You can feel it take effect almost immediately, a warm feeling coursing through your body as your muscles relax. Though you suspect that the effect is only temporary, you’ll need all the help you can get to take this monster.`);
                        Text.NL();
                    }
                    Text.Out(`A momentary glimmer of simmering intelligence in the brain of the aroused matriarch saves you from being crushed under her humping form. Vena rolls you over on your side${pc.haslegs(`, lifting your ${pc.legs} out of the way`)}, the warm weight of her pregnant belly heavy on you. She’s quick to press the broad tip of her enormous girl-cock against your ${targetDesc}, quickly impaling your unprepared nethers.`);
                    Text.NL();

                    if (target === BodyPartType.vagina) {
                        Sex.Vaginal(vena, player);
                        player.FuckVag(player.FirstVag(), vena.FirstCock(), 25);
                        vena.Fuck(vena.FirstCock(), 25);

                        VenaScenes.Impregnate(player, vena, PregnancyHandler.Slot.Vag);
                    } else {
                        Sex.Anal(vena, player);
                        player.FuckAnal(player.Butt(), vena.FirstCock(), 25);
                        vena.Fuck(vena.FirstCock(), 25);

                        VenaScenes.Impregnate(player, vena, PregnancyHandler.Slot.Butt);
                    }

                    if (cap < 60) {
                        Text.Out(`You cry out as the massive shaft stretches your hole unnaturally, forcing your body way past its usual limits. Thanks to Ophelia, there is no pain, but the overwhelming fullness is still far more than you can handle.`);
                    } else {
                        Text.Out(`Your body may be accustomed to insertions of her size, but you are still taken aback by her ferocity.`);
                    }
                    Text.Out(` The matriarch digs in like one starved for sex, driving the air from your lungs as she sheathes her massive member inside you in one smooth motion, filling you utterly. All you can do is to hold on for dear life as she rails you, accompanied by Lagon’s malicious laughter.

                    “Do you not feel proud of your mother, Ophelia?” he leers, hugging her close, making sure that she’s watching. “And all of this thanks to you!” The alchemist’s cheeks are burning in shame. Whatever else, she can’t deny the truth of his words. The rabbit king’s hand ventures further down, caressing her butt through the fabric of her lab coat. “I think my daughter deserves a reward...”

                    All of this barely registers with your overloaded senses. You have your own problems to deal with - two whole feet of problems currently mercilessly pummeling your ${targetDesc}. Vena cries out in ecstasy as she impales you on her massive cock time and time again, fucking you with seemingly endless vigor.

                    The first of many loads already rests in your belly, the sheer amount of hot seed indicating that you’ll be at least as bloated as the matriarch by the time this ends. Moaning deliriously, you clutch at your swollen stomach as Vena rolls you over on your back, coating your ${pc.skin} in the excess cum of a thousand orgasms.${pc.hascock(` Some of it may even be your own.`)}

                    Gradually, you notice that you are not the only one receiving this rough treatment; beside you, Ophelia in kneeling on all fours, panting as her father takes her from behind. Her eyes focus on you for a second and she leans in under the pretense of giving you a kiss. Under her breath, she whispers: “Sorry. Hang - unf! - in there!”`);
                    Text.NL();
                    // BAD END
                    if (player.sexlevel < 5) {
                        player.AddLustFraction(1);

                        Text.Out(`Unable to respond, you moan loudly as you cum, your body wrecked by the lagomorph matriarch. Sorry? Why should she be sorry? This feels amazing… you’ve never felt so good in your life! Vena’s stamina is endless, only eclipsed by her burning lust.

                        After the first dozen orgasms, your body - with the aid of Ophelia’s pill - has somehow adjusted to Vena’s immense size. Another dozen, and you’ve forgotten why you’re even here - staying and continuing this blissful orgy is all you crave. As you delve further and further into depravity, you forget your quest, your friends… even your own name. All you know is the glorious feeling of being stuffed by Vena’s cock.

                        <b>Time passes…</b>`);
                        Text.Flush();

                        Gui.NextPrompt(() => {
                            Text.Clear();
                            Text.Out(`You don’t know how long you’ve been here in the Pit, and you no longer care to leave your new home. Ever since Vena finished with you, your life has been an endless stream of being fucked over and over again by countless lagomorphs. They come in all shapes and sizes - sometimes the rabbit king even graces you with his presence - but nothing matches the feeling of Vena taking you.

                            Though your mind is dulled, you still vaguely notice that your body has gradually changed. Ophelia has been feeding you all these amazing drinks, slowly turning you into a prefect rabbit breeding slut${pc.hasvag(``, `, complete with a fuckable pussy and a fertile womb`)}.

                            These days, your belly is constantly swollen with litter after litter of young - not that this lessens the number of suitors you have. It is, after all, your duty to sate the desires of the colony.

                            Sometimes, you think you see someone you know within orgy of the Pit; perhaps a former lover or companion, you can’t be sure. Those days are long past… you just hope that they, like you, find their place here among the rabbits.

                            <b>Thus, your journey comes to an end, in the breeding pit of the lagomorph king.</b>`);
                            Text.Flush();

                            TimeStep({season: 1});

                            SetGameOverButton();
                        });
                    } else { // High sex level
                        Text.Out(`She worries too much, you can take this… or at least you hope you can. Perhaps it’s due to the mixture of transformatives surging through her veins, but Vena seems even more aroused than usual, relishing in being the one on top for once. Crying out in pleasure, the bloated hermaphrodite bunny unleashes her unrestrained lust upon you, and all you can do is hang on for dear life.

                        Despite your best efforts, she drives you to orgasm before cumming herself. Not that it ends there; there is still a boundless energy flowing through the matriarch, and her cock is still stiff inside you, even as your stomach swells from her last climax. Looks like you are in for the long ride.

                        You give Ophelia an encouraging smile, returning her faux kiss in earnest. Together, you’ll get through this, and while you’re at it, you might as well enjoy it, right?`);
                        Text.NL();

                        const cum = player.OrgasmCum(3);

                        Text.Flush();

                        Gui.NextPrompt(() => {
                            Text.Clear();
                            Text.Out(`Later - a lot later - when the lagomorph matriarch and patriarch have sated their urges, you warily get up, joints aching from the brutal fucking. Your stomach is bulging, stuffed with over a dozen loads from both Vena and Lagon. Thankfully, Ophelia seems to be better off, and she helps you along as you slowly make your way back to the throne room, Lagon in the lead.

                            “T-thank you,” she whispers, watching her father’s back nervously. “I don’t think I could’ve resisted through that, I’ve never seen mother as fierce as that before...” You weakly assure her that it was nothing; you’ll talk later, but now is not the time. She nods, letting you rest your weight on her shoulder.`);
                            Text.Flush();

                            ophelia.relation.IncreaseStat(100, 25);
                            TimeStep({hour: 8});

                            Gui.NextPrompt();
                        });
                    }
                }, enabled : true,
                tooltip,
            });
            options.push({ nameStr : `Attack`,
                func() {
                    Gui.Callstack.pop();
                    Text.Clear();
                    Text.Out(`No. Fuck this. You’re not going to let this go on for any longer. Time to put the self-proclaimed king of the rabbits in his place. Without letting your eyes off Lagon, you tell Ophelia to run away; to trust in you. A look of surprise passes over Lagon’s face, quickly replaced by a contemptuous sneer.

                    “So this is where you choose to defy me, traveler,” he rumbles, casually rolling his shoulders. “If you won’t take the carrot, I’ll have to use the stick instead. A curious twist of fate that the stage of your little rebellion will be your home from this point forth...”

                    If you hadn’t been closely watching out for it, the kick would have caught you right in the temple. As it is, you barely manage to pull out of its trajectory, settling into a combat stance.`);
                    Text.NL();
                    if (party.InParty(kiakai)) {
                        Text.Out(`“I agree with ${pc.name},” ${kiakai.name} announces, standing at your shoulder. “Your foul reign has gone on for too long!”`);
                        Text.NL();
                    }
                    if (party.InParty(terry)) {
                        Text.Out(`“We really doing this?” Terry looks around at the crowd nervously. “We don’t really have the numbers on our side, ${pc.name}.”`);
                        Text.NL();
                    }
                    if (party.InParty(miranda)) {
                        Text.Out(`“’Bout time we knocked you down to size,” Miranda cracks her knuckles, grinning in anticipation. “Bring it! Not every day I get to dethrone a king!”`);
                        Text.NL();
                    }
                    Text.Out(`Lagon shakes his head, laughing at the spectacle.

                    “Let’s see how cocky you are once I’ve pounded you into the ground!” he roars, calling his troops to battle. It’s a fight!`);
                    Text.Flush();

                    Gui.NextPrompt(() => {
                        const enemy = new Party();
                        const lagonMob = new LagonRegular(false);
                        enemy.AddMember(lagonMob);
                        enemy.AddMember(new LagomorphAlpha(Gender.Random()));
                        enemy.AddMember(new Lagomorph(Gender.Random()));
                        enemy.AddMember(new Lagomorph(Gender.Random()));
                        const enc = new Encounter(enemy);

                        enc.canRun = true;
                        enc.VictoryCondition = () => {
                            return lagonMob.Incapacitated();
                        };

                        enc.onLoss = LagonScenes.PitDefianceLoss;
                        enc.onVictory = LagonScenes.PitDefianceWin;

                        enc.Start();
                    });
                }, enabled : true,
                tooltip : `This shit has gone on for too long. Time to wipe that grin off Lagon’s fucking face.`,
            });
            Gui.SetButtonsFromList(options, false, undefined);

            Gui.Callstack.push(() => {
                Text.Clear();
                Text.Out(`Once back in the throne room, Lagon hops onto his throne.

                “Once again, you have done me good service. What do you wish as your reward, traveler? I can offer you some of Ophelia’s stock.” He lays out a set of vials in front of you, studying your face for reactions. You try to keep your expression neutral, knowing that you are still in the lion’s den.`);
                Text.NL();

                Gui.Callstack.push(() => {
                    Text.NL();
                    Text.Out(`“You may leave us. You too, daughter,” Lagon adds haughtily. “I’ve no further need for your lab. Once you’ve used up the last of your ingredients on yourself, you are to take your place besides your mother in the breeding pit, fathering the next generation of soldiers in my army.”

                    With that, he dismisses the two of you.`);
                    Text.Flush();

                    Gui.NextPrompt(() => {
                        Text.Clear();
                        if (fuckedByVena) {
                            Text.Out(`Ophelia tries to aid you on the way back to her lab, supporting as much of your weight as she’s able. She looks very grateful, having narrowly avoided being broken by her own mother.`);
                        } else {
                            Text.Out(`Ophelia is still shaking as you lead her from the room back toward her lab. The alchemist is barely able to stand after her fucking; her legs won’t support her.`);
                        }
                        Text.NL();
                        Text.Out(`“T-this time, he has gone too f-far,” she mutters under her breath, clutching your arm wearily. “He leaves me no choice...” You eye your escort warily, but they don’t seem to have noticed Ophelia’s treasonous aspirations. Once you are back at the lab, she shuts the door behind you, collapsing on top of a pile of straw intended for her ‘volunteers’.`);
                        Text.NL();

                        OpheliaScenes.ScepterRequest(false);

                        Text.Flush();

                        party.location = WORLD().loc.Burrows.Lab;

                        Gui.NextPrompt();
                    });
                });

                OpheliaScenes.RewardChoices();
            });
        }
    }

    export function ScepterRequest(fight: boolean) {
        const player: Player = GAME().player;
        const pc = player.Parser;

        Text.Out(`After a long pause, the lagomorph alchemist speaks. “Would you help me with one final thing, ${pc.name}?” Her words are calm and resolute, though you can sense her barely contained fury just below the surface. “My father needs to be stopped, no matter the cost. I won’t ask you to face him${fight ? ` again` : ``} - he is much too strong… but there is perhaps someone who can. Someone who was once like him.” She looks over to you, her eyes ${fight ? `determined` : `haggard`}. “My mother.”

        “I… I overheard my father ordering some of his soldiers to go and hunt down a certain object, a scepter that was previously in his possession.” `);
        if (fight) {
            Text.Out(`Ophelia stares off into the distance, tapping her chin thoughtfully. “Knowing I’d heard about something like it before, I scoured my notes, and found a scavenged document depicting said scepter - or at least the gem mounted in it.”`);
        } else {
            Text.Out(`Ophelia makes her way over to her desk, pulling out a scroll from behind a set of jars. You get the sense that she’s kept it hidden there. “I found this among the stuff scavenged by the patrols.” The parchment depicts a strange rock, and it’s covered in a tiny scrawl.`);
        }
        Text.NL();
        Text.Out(`“It took me a while to decipher it, since it wasn’t written in a language of this world, but it describes some rather interesting properties of this stone. Without going into details, I suspect it might have had more than a little role in my father’s ‘awakening’. Perhaps it could restore my mother.”

        She leans forward intently. “I recognized the stone right away. It was the main piece of father’s scepter! I suspect that he doesn’t know its true significance, or he would be pouring more resources into retrieving it.”

        “The problem is finding it… The scepter was stolen by my little brother, Roa, when he escaped the burrows some time ago.” The alchemist looks wistful. “I always liked little Roa, but he couldn’t stand living here. At the time, I thought him foolish for leaving the fold, but in hindsight, I wish I had joined him.”

        “It’s a long shot, but Roa might still have the scepter. If I only knew where he was...” Ophelia hangs her head in defeat. “Who knows if he is even alive. He was always the favorite amongst his brothers, and he seemed to secretly enjoy being used by them. Wherever he is now, I don’t think that has changed.”

        You agree to look for the estranged rabbit and the scepter he may or may not carry. Ophelia looks cheerfully optimistic, but you feel this is probably her last strand of hope.`);
        if (fight) {
            Text.NL();
            Text.Out(`“You probably shouldn’t return until you have found the scepter; father’s guards are probably heading here as we speak.” The alchemist puts on a brave face, though you see the fear hiding just beneath the surface. “Don’t worry about me; I’ll lay low for a while.”

            The hidden meaning behind her words is ‘hurry’.`);
        }
    }

    export function WatchVenaEntry() {
        Text.Out(`Ophelia cowers uncertainly in front of the advancing matriarch; wanting to flee but held back by her instincts. No matter how far she’s gone, this is still her mother; she would never harm her, right? Not only that, no matter how refined she wants to present herself, it’s becoming more and more obvious to you that the alchemist cannot escape her innate carnal urges - part of her <i>desires</i> what is coming, <i>craves</i> it.

        “Y-you are beautiful, mother,” she stammers, blushing as her eyes drink in the majestic sight of Vena. Like always, the matriarch is pregnant - with Lagon’s seed or one of her own sons, you don’t know - her belly swelling out like a dome, her large breasts heavy with milk. With her newly grown muscle, she doesn’t seem to have any problem carrying the added weight. Jutting out beneath her taut stomach is her stiff, massive girl-cock.

        “Ophelia... daughter… pretty.” Vena’s words are halting, surprising even Lagon. The alchemist’s eyes are big as saucers as she’s swept up in her mother’s arms, held close in a gentle hug. “Gratitude… love,” the matriarch beams, giving Ophelia a deep kiss, thanking her for the new body her daughter has granted her.

        The alchemist moans weakly, smothered between the larger lagomorph’s breasts. Vena has placed her astride the convenient erect pole, sighing happily as Ophelia grinds her hips against the slippery appendage. Her entire body weight is balancing on her mother’s cock, her legs dangling down feebly - too short to reach the ground. The two share another kiss before Vena slowly lowers Ophelia to the ground, laying the bespectacled bunny down on her back.

        “Looks like the fun is about to start,” Lagon observes, eyes gleaming. It’s hard to keep your mind focused in the carnal environment of the Pit${stoppedVena ? `, especially with your face in the pool of cum` : ``}, but you do your best to keep your eyes on the rabbit king. By this point, it’s clear that he doesn’t give two fucks about either you or Ophelia - daughter or no. He just wants to douse the flame of rebellion from her heart, and uses the most cruel measure possible to do so: her own mother. That it was through her own efforts - with some aid from you - that Vena is in her current state only serves to twist the knife further.

        Ophelia cries out in rapture as the matriarch slowly presses her thick, lubed-up shaft into the smaller bunny’s protesting folds. Her frame may be built for breeding, but she’s not accustomed to taking cocks of Vena’s size. The older lagomorph does her best to be gentle, but the sheer girth of her two-foot member is more than a bit intimidating for the gasping scientist.

        “Mmh… deeper…!” the alchemist begs, completely swallowed by her lust. Vena needs little encouragement; if anything, she’s been holding herself back. Her restrictions lifted, she eagerly thrusts into her daughter’s willing snatch, panting like an animal as her cock sinks into the receptive hole. Riled on by their matriarch, the participants of the orgy around you intensify their rutting, some of them coming over to gather around the pair, dicks at the ready. At Lagon’s growled command, they keep their distance, content to jerk off and shower the writhing pair in their seed.

        You continue to watch as Vena fucks her daughter’s brains out, flipping her over on her stomach and thrusting into her from behind. Bred like a bitch, Ophelia moans as the gathered bunnies unload on her face, her eyes rolled back in ecstasy. The matriarch seems to possess an endless reserve of energy; she relentlessly pounds her daughter’s pussy for what feels like hours on end, not even stopping her rutting when she cums. Were it you there beneath her, you are not sure you could have taken it.

        When her fire finally goes down, Lagon walks over to Ophelia, mockingly saying: “I wanted you to know that your mother loves the new changes to her body. Without you, she wouldn’t be the same person she is today!” Turning to Vena, he continues: “What do you think, my dear, is our daughter ready to join you here in the Pit, take up her true calling as a breeding slut in my colony?”

        Vena is lying on her side, eyes half closed as she caresses her daughter’s bloated, cum-filled stomach. “Breed...” she whispers, smiling contently before falling into sleep. On Lagon’s instructions, her eager sons contain their lust, content to snuggle up to their resting matriarch.

        “Follow, unless you’d rather stay here and take her place,” the rabbit king callously tells his daughter, heading back toward the throne room. You help Ophelia up on her knees, looking at her with worry. In her eyes, you see a bright spark of shame and anger; shame at herself for bringing her mother to this point, for not resisting. Anger at Lagon, the monster who forced her to this.

        The girl is silent on the way back, leaning unsteadily on your shoulder.`);
        Text.Flush();

        TimeStep({hour: 2});

        Gui.NextPrompt();
    }

    export function RewardAftermathStage2Prompt() {
        const ophelia: Ophelia = GAME().ophelia;

        // [Sorry][Encourage][Rebuke]
        const options: IChoice[] = [];
        if (WatchedOphelia) {
            options.push({ nameStr : `Sorry`,
                func() {
                    Text.Clear();
                    Text.Out(`“N-no, that is fine,” Ophelia gives herself a tiny shake. “I fully understand. You are not from here and have no stake in this… not to mention you cannot beat my father. No one can.”

                    She looks even more depressed, but you get the feeling that she appreciated your intentions.`);
                    Text.Flush();

                    ophelia.relation.IncreaseStat(100, 5);

                    WatchedOphelia = false;

                    OpheliaScenes.RewardAftermathStage2Prompt();
                }, enabled : true,
                tooltip : `Apologize for not standing up to her before.`,
            });
        }
        options.push({ nameStr : `Encourage`,
            func() {
                Text.Clear();
                Text.Out(`“I… I just don’t want you to do anything stupid,” she frets, though she looks happy to have your support. “My father… no one who has gone up against him has lived through it. The only reason he still keeps me around after I defied him is that he needs me. Promise you won’t do anything rash, okay?”`);

                ophelia.relation.IncreaseStat(100, 5);

                Gui.PrintDefaultOptions();
            }, enabled : true,
            tooltip : `Her father goes too far, and should be stopped.`,
        });
        options.push({ nameStr : `Rebuke`,
            func() {
                Text.Clear();
                Text.Out(`“I am <b>already</b> in danger. You have seen my mother. Father will do the same to me the very moment I stop being useful to him.” You have to admit that she has a point - from what you have seen of him, Lagon seems to be an exceedingly ruthless king, not to mention an uncaring parent.`);

                ophelia.relation.DecreaseStat(-100, 5);

                Gui.PrintDefaultOptions();
            }, enabled : true,
            tooltip : `She shouldn’t keep defying her father, as it will put her in danger.`,
        });
        Gui.SetButtonsFromList(options, false, undefined);
    }

    export function RewardChoices() {
        const player: Player = GAME().player;
        const pc = player.Parser;
        const party: Party = GAME().party;
        const lagon: Lagon = GAME().lagon;

        Text.Out(`<b>Pick your reward. Any potions you choose will be consumed on the spot.</b>`);
        Text.Flush();

        party.location = WORLD().loc.Burrows.Throne;

        // [Virility][Fertility][Breeder][Gold][Sex]
        const options: IChoice[] = [];
        if (!player.HasPerk(Perks.Virility)) {
            options.push({ nameStr : `Virility`,
                func() {
                    Text.Clear();
                    Text.Out(`“This one will help you with the ladies, provided you can find someone who will spread her legs.” Lagon hands you the potion. `);
                    if (player.FirstCock()) {
                        Text.Out(`You chug it down, sighing as a feeling of warmth spreads through your loins, sending a tangible twinge through your ${pc.balls}. Suddenly, you feel very potent.`);
                    } else {
                        Text.Out(`“I doubt it would do much for you though, but if you want it, why not,” he adds, noting your lack of male genitalia. Like he says, the potion doesn’t seem to have very much effect, though you get a warm feeling in your crotch.`);
                    }
                    Text.NL();
                    Text.Out(`<b>You gain the Virility perk.</b>`);
                    Text.Flush();

                    player.AddPerk(Perks.Virility);

                    player.AddLustFraction(1);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `Increase your cum production, capacity and potency.`,
            });
        }
        if (!player.HasPerk(Perks.Fertility)) {
            options.push({ nameStr : `Fertility`,
                func() {
                    Text.Clear();
                    Text.Out(`“Ah, I remember this one,” Lagon smiles fondly. “One of Ophelia’s first successful experiments. I don’t even know how much of this stuff Vena has drunk - it’s practically a cornerstone of her diet now. Still, I can spare this much.” He hands you the potion, which you promptly chug down.`);
                    if (player.FirstVag()) {
                        Text.Out(` The potion goes to work immediately, spreading a warm feeling through your chest and your womb. When it finally recedes, you are left aching to be filled.`);
                    } else {
                        Text.Out(` “I honestly have no idea what it would do to a male, but I hope you enjoy it all the same.” A warm feeling spreads through your chest and groin, but you are not sure it did much of anything.`);
                    }
                    Text.NL();
                    Text.Out(`<b>You gain the Fertility perk.</b>`);
                    Text.Flush();

                    player.AddPerk(Perks.Fertility);

                    player.AddLustFraction(1);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `Increase your chances of getting pregnant. Additionally, it increases your milk capacity and production.`,
            });
        }
        if (!player.HasPerk(Perks.Breeder)) {
            options.push({ nameStr : `Breeder`,
                func() {
                    Text.Clear();
                    Text.Out(`“A staple of Vena’s daily diet, it’ll have you popping out babies in no time.” Lagon grins as he hands you the potion, whispering something to one of his attendants as you drink it. `);
                    if (player.FirstVag()) {
                        Text.Out(`The potion goes to work immediately, spreading a warm feeling in your womb. When it finally recedes, you are left aching to be filled, to breed.`);
                    } else {
                        Text.Out(`“I honestly have no idea what it would do to a male, but I hope you enjoy it all the same.” A warm feeling spreads through your stomach, but you are not sure it did much of anything.`);
                    }
                    Text.NL();
                    Text.Out(`<b>You gain the Breeder perk.</b>`);
                    Text.Flush();

                    player.AddPerk(Perks.Breeder);

                    player.AddLustFraction(1);

                    Gui.PrintDefaultOptions();
                }, enabled : true,
                tooltip : `Shortens gestation period and increases the chances of having multiple children.`,
            });
        }
        // Always available
        options.push({ nameStr : `Gold`,
            func() {
                Text.Clear();
                Text.Out(`“Just in it for the money, eh? I have little use for it anyways.” Lagon shrugs, clapping his hands sharply. Two of his flunkies drag forth a large sack of money, dumping it on the floor in front of you with a loud clink.

                <b>You receive 1500 coins!</b>`);
                Text.Flush();

                party.coin += 1500;

                Gui.PrintDefaultOptions();
            }, enabled : true,
            tooltip : `Ask for treasures. Lagon is offering you 1500 coins for your services.`,
        });
        if (rewardSexFlag === false) {
            options.push({ nameStr : `Sex`,
                func() {
                    Text.Clear();
                    Text.Out(`“You really are quite the slut, aren’t you?” Lagon laughs, amused at your pleading. “I’ll fuck you raw any time you ask. Surely you want something more for your reward…?” By his grin, he is toying with you, as he spreads his legs slightly to give you easier access to his groin. You scramble forward eagerly, wrapping your lips around his cock. Inside your mouth, his thick rod grows and stiffens, overpowering your senses of taste and smell, not to mention straining your jaw to its limits.

                    “Good job, pet, such a dirty mouth you have...” Lagon encourages you, gently bucking his hips, pushing more of his dick inside you even as it rises to its full glory. Your mouth is crammed so full you can hardly breathe, and there is still so much more of it to take, each inch soaked in the delicious mix of his spunk and Vena’s juices.

                    “Like that?” the king teases, grinning widely. “You’re not too bad, perhaps I’ll indulge your begging later, give your slutty holes a good, deep fuck. Before you forget it entirely, what did you wish for your reward?”

                    You briefly pull off his cock to answer him, eager to get back to what you were doing.`);
                    Text.Flush();

                    lagon.relation.IncreaseStat(100, 10);
                    player.subDom.DecreaseStat(-100, 5);

                    rewardSexFlag = true;

                    Gui.Callstack.push(() => {
                        Text.Clear();
                        Text.Out(`“Good, now finish up, little slut,” Lagon grunts, guiding your head back down on his member. You focus your attention of his cockhead, lapping away with your ${pc.tongue}, greedily cleaning up his trickling pre. Getting him off is a pretty quick process, though you get the feeling he is humoring you to give you your ‘reward’ quickly.

                        The large paw holding your head firmly in place leaves you little choice but to swallow his immense load, which pours down your throat like a raging torrent. Pleased with your treat, you clean up his cock, licking up as much of his cum as you can before you get back to your feet.`);

                        TimeStep({minute: 10});

                        Gui.PrintDefaultOptions();
                    });

                    OpheliaScenes.RewardChoices();
                }, enabled : true,
                tooltip : `The sight of his magnificent cock is such a distraction, you can hardly keep your thoughts straight. Perhaps just a quick fuck first…?`,
            });
        }
        /* TODO
        options.push({ nameStr : `name`,
            func : () => {
                Text.Clear();
                Text.Out(``);
                Text.NL();
                Text.Flush();

                Gui.NextPrompt();
            }, enabled : true,
            tooltip : ``
        });
        */
        Gui.SetButtonsFromList(options, false, undefined);
    }
}
