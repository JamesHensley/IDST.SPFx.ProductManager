import { SpListAttachment, SPAuthor, SpProductItem } from '../models/SpListItem';
import { v4 as uuidv4 } from 'uuid';
import AppService from './AppService';
import { TaskModel, TaskState } from '../models/TaskModel';
import { subDays, addDays, startOfDay } from 'date-fns';
import { ProductModel, ProductStatus } from '../models/ProductModel';
import { MapperService } from './MapperService';

export class Faker {
    private static _fakeCustomers = ['Doctor Creep', 'George Washington', 'Daniel Boone'];

    public static CreateFakeAttachment(linkedProductGuid: string, fileName: string): SpListAttachment {
        const attachmentName = fileName ? fileName.split('.').reverse()[1] : [ 'File1', 'File2', 'File3', 'File4', 'File5' ][Math.round(Math.random() * 4)];
        const extn = fileName ? fileName.split('.').reverse()[0] : ['docx', 'doc','ppt', 'pptx', 'xls', 'xlsx', 'txt', 'pdf', 'csv', 'json'][Math.round(Math.random() * 7)];

        const author = AppService.CurrentSpUser;

        const attachment: SpListAttachment = new SpListAttachment({
            Author: { Name: author.displayName, Email: author.email } as SPAuthor,
            Id: uuidv4(),
            Updated: new Date(),
            Title: fileName ? fileName.split('.').reverse()[1] : `Attached Document ${Math.round(Math.random() * 300)}`,
            Url: `${AppService.AppSettings.miscSettings.documentListUrl}/${attachmentName}.${extn}`,
            Version: 1,
            LinkedProductGuid: linkedProductGuid
        });
        return attachment;
    }

    private static CreateFakeTask(teamId: string, desc: string, startDate: Date, expectedDaysToWork: number, state: string): TaskModel {
        // startDate is the (expected) date the first task begins
        const expectedFinish = addDays(startDate, expectedDaysToWork);

        // Gives us about a 30% chance this task will break it's suspense
        const willBustSuspense = (Math.random() * 10) >= 7;

        const expectedStart = (TaskState[state] === TaskState.working || TaskState[state] === TaskState.complete) ? subDays(expectedFinish, expectedDaysToWork) : null;
        const actualFinish = (TaskState[state] === TaskState.complete) ? (willBustSuspense ? addDays(expectedFinish, 1) : subDays(expectedFinish, 1)) : null;

        return new TaskModel({
            taskedTeamId: teamId,
            taskDescription: desc,
            taskState: TaskState[state],
            taskGuid: uuidv4(),
            taskSuspense: expectedFinish.toJSON(),
            taskStart: expectedStart,
            taskFinish: actualFinish
        });
    }

    public static CreateFakeItem(title?: string): SpProductItem {
        const newItemGuid = uuidv4();

        const prodType = (AppService.AppSettings.productTypes[Math.round(Math.random() * (AppService.AppSettings.productTypes.length - 1))]);
        const beginWork = startOfDay(subDays(new Date(), Math.round(Math.random() * 60)));
        const endDate = addDays(beginWork, (Math.round(Math.random() * 13) + 1));

        const item = new ProductModel({
            spId: Math.floor(Math.random() * 300),
            spGuid: newItemGuid,
            guid: newItemGuid,
            active: true,
            title: (title ? title : this.mockTitles[Math.round(Math.random() * (this.mockTitles.length - 1))]),
            description: this.mockSentences[Math.round(Math.random() * (this.mockSentences.length - 1))],
            productType: prodType.typeId,
            requestDate: beginWork,
            customer: this._fakeCustomers[Math.round(Math.random() * (this._fakeCustomers.length - 1))],
            categoryId: (AppService.AppSettings.categories[Math.round(Math.random() * (AppService.AppSettings.categories.length - 1))]).categoryId,
            classificationId: (AppService.AppSettings.classificationModels[Math.round(Math.random() * (AppService.AppSettings.classificationModels.length - 1))]).classificationId,
            requestUrl: 'https://www.github.com',
            requestor: 'Some Requestor',
            comments: [],
            tasks: []
        });

        const taskState = (states => states[Math.round(Math.random() * (states.length - 1))])(['pending', 'working', 'working', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'complete']);
        item.tasks = prodType.defaultTeamTasks.map((d, i, e) => {
            const xy = e.reduce((t, n, c) => c < i ? addDays(t, n.typicalTaskLength) : t, beginWork);
            const xx = e.reduce((t, n, c) => c <= i ? addDays(t, n.typicalTaskLength) : t, beginWork);
            return this.CreateFakeTask(d.teamId, d.taskDescription, xy, d.typicalTaskLength, taskState);
        });
        item.status = item.tasks
            .map(d => d.taskState)
            .reduce((t, n) => n === TaskState.complete && t === TaskState.complete ? t : TaskState.working, TaskState.complete) === TaskState.complete ? ProductStatus.closed : ProductStatus.open;

        const eventModel = prodType.defaultEventType ? AppService.AppSettings.eventTypes.reduce((t, n) => n.eventTypeId === prodType.defaultEventType ? n : t, null) : null;
        if (eventModel) {
            const lastCloseDate = item.status === ProductStatus.closed ? (item.tasks.map(d => d.taskFinish).sort()[0]) : endDate;
            item.eventType = eventModel.eventTypeId;
            item.eventDateStart = addDays(lastCloseDate, 2);
            item.eventDateEnd = eventModel.defaultEventLength ? addDays(item.eventDateStart, eventModel.defaultEventLength) : null;
        }

        // Create fake attachments for this fake item
        prodType.defaultTemplateDocs.forEach(f => this.CreateFakeAttachment(item.guid, AppService.AppSettings.templateDocuments.reduce((t, n) => n.templateId === f ? n.documentName : t, '')));
        return MapperService.MapProductToItem(item);
    }

    private static mockSentences: Array<string> = [
        `The Guinea fowl flies through the air with all the grace of a turtle.`,
        `He was disappointed when he found the beach to be so sandy and the sun so sunny.`,
        `The fact that there's a stairway to heaven and a highway to hell explains life well.`,
        `She couldn't understand why nobody else could see that the sky is full of cotton candy.`,
        `If you like tuna and tomato sauce- try combining the two. It’s really not as bad as it sounds.`,
        `It was the first time he had ever seen someone cook dinner on an elephant.`,
        `The delicious aroma from the kitchen was ruined by cigarette smoke.`,
        `She used her own hair in the soup to give it more flavor.`,
        `She borrowed the book from him many years ago and hasn't yet returned it.`,
        `She was disgusted he couldn’t tell the difference between lemonade and limeade.`,
        `Mary plays the piano.`,
        `The hand sanitizer was actually clear glue.`,
        `He found a leprechaun in his walnut shell.`,
        `The fox in the tophat whispered into the ear of the rabbit.`,
        `Nobody questions who built the pyramids in Mexico.`,
        `Martha came to the conclusion that shake weights are a great gift for any occasion.`,
        `I would have gotten the promotion, but my attendance wasn’t good enough.`,
        `She traveled because it cost the same as therapy and was a lot more enjoyable.`,
        `Yeah, I think it's a good environment for learning English.`,
        `She couldn't decide of the glass was half empty or half full so she drank it.`,
        `He found the chocolate covered roaches quite tasty.`,
        `He dreamed of eating green apples with worms.`,
        `A purple pig and a green donkey flew a kite in the middle of the night and ended up sunburnt.`,
        `Excitement replaced fear until the final moment.`,
        `Please tell me you don't work in a morgue.`,
        `The minute she landed she understood the reason this was a fly-over state.`,
        `He picked up trash in his spare time to dump in his neighbor's yard.`,
        `Her daily goal was to improve on yesterday.`,
        `Greetings from the real universe.`,
        `She hadn't had her cup of coffee, and that made things all the worse.`,
        `The fish dreamed of escaping the fishbowl and into the toilet where he saw his friend go.`,
        `Cursive writing is the best way to build a race track.`,
        `It's difficult to understand the lengths he'd go to remain short.`,
        `Beach-combing replaced wine tasting as his new obsession.`,
        `He embraced his new life as an eggplant.`,
        `She learned that water bottles are no longer just to hold liquid, but they're also status symbols.`,
        `Of course, she loves her pink bunny slippers.`,
        `Green should have smelled more tranquil, but somehow it just tasted rotten.`,
        `The three-year-old girl ran down the beach as the kite flew behind her.`,
        `He put heat on the wound to see what would grow.`,
        `Weather is not trivial - it's especially important when you're standing in it.`,
        `A kangaroo is really just a rabbit on steroids.`,
        `Lucifer was surprised at the amount of life at Death Valley.`,
        `He set out for a short walk, but now all he could see were mangroves and water were for miles.`,
        `David subscribes to the \`stuff your tent into the bag\` strategy over nicely folding it.`,
        `100 years old is such a young age if you happen to be a bristlecone pine.`,
        `He said he was not there yesterday; however, many people saw him there.`,
        `As she walked along the street and looked in the gutter, she realized facemasks had become the new cigarette butts.`,
        `While all her friends were positive that Mary had a sixth sense, she knew she actually had a seventh sense.`,
        `He swore he just saw his sushi move.`,
        `There is no better feeling than staring at a wall with closed eyes.`,
        `The three-year-old girl ran down the beach as the kite flew behind her.`,
        `I am my aunt's sister's daughter.`,
        `Martha came to the conclusion that shake weights are a great gift for any occasion.`,
        `It caught him off guard that space smelled of seared steak.`,
        `He had reached the point where he was paranoid about being paranoid.`,
        `The mysterious diary records the voice.`,
        `I was very proud of my nickname throughout high school; couldn’t be any different to what my nickname was.`,
        `She looked at the masterpiece hanging in the museu… think is that her five-year-old could do better.`,
        `It was at that moment that he learned there are certain parts of the body that you should never Nair.`,
        `I liked their first two albums but changed my mind after that charity gig.`,
        `Garlic ice-cream was her favorite.`,
        `He had concluded that pigs must be able to fly in Hog Heaven.`,
        `Cursive writing is the best way to build a race track.`,
        `She hadn't had her cup of coffee, and that made things all the worse.`,
        `I purchased a baby clown from the Russian terrorist black market.`,
        `Everyone was busy, so I went to the movie alone.`,
        `Too many prisons have become early coffins.`,
        `She used her own hair in the soup to give it more flavor.`,
        `She did a happy dance because all of the socks from the dryer matched.`,
        `He was 100% into fasting with her until he understood that meant he couldn't eat.`,
        `The two walked down the slot canyon oblivious to the sound of thunder in the distance.`,
        `Peanut butter and jelly caused the elderly lady to think about her past.`,
        `We should play with legos at camp.`,
        `All she wanted was the answer, but she had no idea how much she would hate it.`,
        `Smoky the Bear secretly started the fires.`,
        `Nothing seemed out of place except the washing machine in the bar.`,
        `There have been days when I wished to be separated from my body, but today wasn’t one of those days.`,
        `The skeleton had skeletons of his own in the closet.`,
        `Three years later, the coffin was still full of Jello.`,
        `She did her best to help him.`,
        `The group quickly understood that toxic waste was …ost effective barrier to use against the zombies.`,
        `He figured a few sticks of dynamite were easier than a fishing pole to catch fish.`,
        `She was too busy always talking about what she wanted to do to actually do any of it.`,
        `When he encountered maize for the first time, he thought it incredibly corny.`,
        `I don’t respect anybody who can’t tell the difference between Pepsi and Coke.`,
        `Nobody has encountered an explosive daisy and lived to tell the tale.`,
        `He swore he just saw his sushi move.`,
        `Just go ahead and press that button.`,
        `The fox in the tophat whispered into the ear of the rabbit.`,
        `With a single flip of the coin, his life changed forever.`,
        `This is a Japanese doll.`,
        `There was no ice cream in the freezer, nor did they have money to go to the store.`,
        `The urgent care center was flooded with patients a…r the news of a new deadly virus was made public.`,
        `The hummingbird's wings blurred while it eagerly sipped the sugar water from the feeder.`,
        `The small white buoys marked the location of hundreds of crab pots.`,
        `Separation anxiety is what happens when you can't find your phone.`,
        `He was the type of guy who liked Christmas lights on his house in the middle of July.`,
        `It was a really good Monday for being a Saturday.`,
        `As the rental car rolled to a stop on the dark road, her fear increased by the moment.`
    ];

    private static mockTitles: Array<string> = [
        `The Ruling Captain`,
        `Stay the King`,
        `Loving Bones`,
        `Heart in Violence`,
        `The Summer of the Elsinore`,
        `Birth Intrigue`,
        `Domestic Portrait`,
        `Homeward the Savage`,
        `The Fearful Challenge`,
        `Pattern Boat`,
        `Maverick for Divorce`,
        `Hell's Temptation`,
        `The Centaur Grace`,
        `The Heiress Catch`,
        `A Bodyguard for Jenny`,
        `The Robot Plain`,
        `The Ruthless Stuff`,
        `The Priority X`,
        `Forecast for Melissa`,
        `A Cargo of Glory`,
        `Summer in Prison`,
        `The Anger of Happiness`,
        `Highland Spies`,
        `The Drums of Shiloh`,
        `Kit's Wing`,
        `Abducted Assets`,
        `The Honourable Groove`,
        `Mr. Sinful`,
        `Hand of Cain`,
        `Mischief in the Sky`,
        `Angel in Marble`,
        `Coven of Smoke`,
        `Ashes in the Mirage`,
        `A Trio for Caroline`,
        `Breathing Delight`,
        `Evolution's Bite`,
        `Chloe's Failure`,
        `A Ranger's Deception`,
        `Feast and Jury`,
        `Political Crush`,
        `The Business Bug`,
        `The Flower of the Bullet`,
        `The Mutant Mists`,
        `Funeral Heart`,
        `Magician's Splendor`,
        `Unhappy Incident`,
        `Enemy Truths`,
        `Arcane Tempest`,
        `Axe Rage`,
        `Dirk Sincaster`,
        `Eternity Nemesisfinder`,
        `Fauna Violeteternity`,
        `Gale Amberknight`,
        `Ghost Lady`,
        `Grief Fauna`,
        `Grief Paradox`,
        `Honor Quake`,
        `Katana Iconkiller`,
        `Lore Kingclash`,
        `Quake Royalsinner`,
        `Rage Ravenstrife`,
        `Raven Lorddream`,
        `Seraph Rascalchanter`,
        `Song Sephiroth`,
        `Sunrise Holyhunter`,
        `Tiger Ladyhunter`,
        `Victory Knight`,
        `Angel Squallaxe`,
        `Blade Lordkiller`,
        `Blizzard Goldchanter`,
        `Blizzard Magusblood`,
        `Icon Flora`,
        `Jasmine Ghostraven`,
        `Jasmine Victory`,
        `Magus Hunter`,
        `Midnight Paradox`,
        `Nemesis Dawndevil`,
        `Nemesis Howlreaper`,
        `Nemesis Zealoteye`,
        `Ragnarok Lonebeast`,
        `Saber Axerouge`,
        `Saber Blizzard`,
        `Sheol Ghostlord`,
        `Star Jackal`,
        `Tiger Lordseeker`,
        `Typhoon Sinnerspawn`,
        `Warden Bladebattler`,
        `Dagger Ruby`,
        `Drake Flamefinder`,
        `Grail Demonwolf`,
        `Jackal Jester`,
        `Leo Watcher`,
        `Lord Blizzard`,
        `Mourner Kingshadow`,
        `Rage Rascalwarlock`,
        `Raven Honorguard`,
        `Reaper Steelhunter`,
        `Rose Spellanchor`,
        `Saber Chaos`,
        `Saber Rage`,
        `Seraph Edendemon`,
        `Squall Wardenbattler`,
        `Stiletto Maxim`,
        `Sunset Sinnerseeker`,
        `Tarot Rascalbeast`,
        `Typhoon Light`,
        `Victor Rogue`,
        `Clash Spiritsin`,
        `Cloud Galeangel`,
        `Furor Shadow`,
        `Hawk Banereaper`,
        `Icon Grimgold`,
        `Light Hawk`,
        `Nemesis Lioneye`,
        `Nemesis Roguefinder`,
        `Radical Ghosthunter`,
        `River Witchmagus`,
        `Rune Dawnmage`,
        `Rune Honor`,
        `Shroud Dreadstrife`,
        `Sinner Rune`,
        `Slayer Quake`,
        `Spirit Ladysinner`,
        `Strife Fauna`,
        `Strife Magicicon`,
        `Sunrise Blademourner`,
        `Wind Fauna`
    ];
}
