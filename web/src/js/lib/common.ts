/// Miscellaneous convenience functions and constants

import emojiData from '@emoji-mart/data';

/*
const emojiCategories = [ 'people', 'nature', 'foods', 'activity', 'places', 'objects' ];
const emojiNames = [];
for ( category of (emojiData as any).categories ) {
    if ( emojiCategories.includes(category.id) ) {
        emojiNames.push(...category.emojis);
    }
}
*/
// This list of emoji names was calculated with the above code on 2022-11-21. We hard-code it here
// to prevent the list from changing when '@emoji-mart/data' gets updated, which would lead to bad UX
// by changing the emojis that get assigned to user addresses.
const emojiNames = ['grinning','smiley','smile','grin','laughing','sweat_smile','rolling_on_the_floor_laughing','joy','slightly_smiling_face','upside_down_face','melting_face','wink','blush','innocent','smiling_face_with_3_hearts','heart_eyes','star-struck','kissing_heart','kissing','relaxed','kissing_closed_eyes','kissing_smiling_eyes','smiling_face_with_tear','yum','stuck_out_tongue','stuck_out_tongue_winking_eye','zany_face','stuck_out_tongue_closed_eyes','money_mouth_face','hugging_face','face_with_hand_over_mouth','face_with_open_eyes_and_hand_over_mouth','face_with_peeking_eye','shushing_face','thinking_face','saluting_face','zipper_mouth_face','face_with_raised_eyebrow','neutral_face','expressionless','no_mouth','dotted_line_face','face_in_clouds','smirk','unamused','face_with_rolling_eyes','grimacing','face_exhaling','lying_face','relieved','pensive','sleepy','drooling_face','sleeping','mask','face_with_thermometer','face_with_head_bandage','nauseated_face','face_vomiting','sneezing_face','hot_face','cold_face','woozy_face','dizzy_face','face_with_spiral_eyes','exploding_head','face_with_cowboy_hat','partying_face','disguised_face','sunglasses','nerd_face','face_with_monocle','confused','face_with_diagonal_mouth','worried','slightly_frowning_face','white_frowning_face','open_mouth','hushed','astonished','flushed','pleading_face','face_holding_back_tears','frowning','anguished','fearful','cold_sweat','disappointed_relieved','cry','sob','scream','confounded','persevere','disappointed','sweat','weary','tired_face','yawning_face','triumph','rage','angry','face_with_symbols_on_mouth','smiling_imp','imp','skull','skull_and_crossbones','hankey','clown_face','japanese_ogre','japanese_goblin','ghost','alien','space_invader','robot_face','wave','raised_back_of_hand','raised_hand_with_fingers_splayed','hand','spock-hand','rightwards_hand','leftwards_hand','palm_down_hand','palm_up_hand','ok_hand','pinched_fingers','pinching_hand','v','crossed_fingers','hand_with_index_finger_and_thumb_crossed','i_love_you_hand_sign','the_horns','call_me_hand','point_left','point_right','point_up_2','middle_finger','point_down','point_up','index_pointing_at_the_viewer','+1','-1','fist','facepunch','left-facing_fist','right-facing_fist','clap','raised_hands','heart_hands','open_hands','palms_up_together','handshake','pray','writing_hand','nail_care','selfie','muscle','mechanical_arm','mechanical_leg','leg','foot','ear','ear_with_hearing_aid','nose','brain','anatomical_heart','lungs','tooth','bone','eyes','eye','tongue','lips','biting_lip','baby','child','boy','girl','adult','person_with_blond_hair','man','bearded_person','man_with_beard','woman_with_beard','red_haired_man','curly_haired_man','white_haired_man','bald_man','woman','red_haired_woman','red_haired_person','curly_haired_woman','curly_haired_person','white_haired_woman','white_haired_person','bald_woman','bald_person','blond-haired-woman','blond-haired-man','older_adult','older_man','older_woman','person_frowning','man-frowning','woman-frowning','person_with_pouting_face','man-pouting','woman-pouting','no_good','man-gesturing-no','woman-gesturing-no','ok_woman','man-gesturing-ok','woman-gesturing-ok','information_desk_person','man-tipping-hand','woman-tipping-hand','raising_hand','man-raising-hand','woman-raising-hand','deaf_person','deaf_man','deaf_woman','bow','man-bowing','woman-bowing','face_palm','man-facepalming','woman-facepalming','shrug','man-shrugging','woman-shrugging','health_worker','male-doctor','female-doctor','student','male-student','female-student','teacher','male-teacher','female-teacher','judge','male-judge','female-judge','farmer','male-farmer','female-farmer','cook','male-cook','female-cook','mechanic','male-mechanic','female-mechanic','factory_worker','male-factory-worker','female-factory-worker','office_worker','male-office-worker','female-office-worker','scientist','male-scientist','female-scientist','technologist','male-technologist','female-technologist','singer','male-singer','female-singer','artist','male-artist','female-artist','pilot','male-pilot','female-pilot','astronaut','male-astronaut','female-astronaut','firefighter','male-firefighter','female-firefighter','cop','male-police-officer','female-police-officer','sleuth_or_spy','male-detective','female-detective','guardsman','male-guard','female-guard','ninja','construction_worker','male-construction-worker','female-construction-worker','person_with_crown','prince','princess','man_with_turban','man-wearing-turban','woman-wearing-turban','man_with_gua_pi_mao','person_with_headscarf','person_in_tuxedo','man_in_tuxedo','woman_in_tuxedo','bride_with_veil','man_with_veil','woman_with_veil','pregnant_woman','pregnant_man','pregnant_person','breast-feeding','woman_feeding_baby','man_feeding_baby','person_feeding_baby','angel','santa','mrs_claus','mx_claus','superhero','male_superhero','female_superhero','supervillain','male_supervillain','female_supervillain','mage','male_mage','female_mage','fairy','male_fairy','female_fairy','vampire','male_vampire','female_vampire','merperson','merman','mermaid','elf','male_elf','female_elf','genie','male_genie','female_genie','zombie','male_zombie','female_zombie','troll','massage','man-getting-massage','woman-getting-massage','haircut','man-getting-haircut','woman-getting-haircut','walking','man-walking','woman-walking','standing_person','man_standing','woman_standing','kneeling_person','man_kneeling','woman_kneeling','person_with_probing_cane','man_with_probing_cane','woman_with_probing_cane','person_in_motorized_wheelchair','man_in_motorized_wheelchair','woman_in_motorized_wheelchair','person_in_manual_wheelchair','man_in_manual_wheelchair','woman_in_manual_wheelchair','runner','man-running','woman-running','dancer','man_dancing','man_in_business_suit_levitating','dancers','men-with-bunny-ears-partying','women-with-bunny-ears-partying','person_in_steamy_room','man_in_steamy_room','woman_in_steamy_room','person_climbing','man_climbing','woman_climbing','fencer','horse_racing','skier','snowboarder','golfer','man-golfing','woman-golfing','surfer','man-surfing','woman-surfing','rowboat','man-rowing-boat','woman-rowing-boat','swimmer','man-swimming','woman-swimming','person_with_ball','man-bouncing-ball','woman-bouncing-ball','weight_lifter','man-lifting-weights','woman-lifting-weights','bicyclist','man-biking','woman-biking','mountain_bicyclist','man-mountain-biking','woman-mountain-biking','person_doing_cartwheel','man-cartwheeling','woman-cartwheeling','wrestlers','man-wrestling','woman-wrestling','water_polo','man-playing-water-polo','woman-playing-water-polo','handball','man-playing-handball','woman-playing-handball','juggling','man-juggling','woman-juggling','person_in_lotus_position','man_in_lotus_position','woman_in_lotus_position','bath','sleeping_accommodation','people_holding_hands','two_women_holding_hands','man_and_woman_holding_hands','two_men_holding_hands','couplekiss','woman-kiss-man','man-kiss-man','woman-kiss-woman','couple_with_heart','woman-heart-man','man-heart-man','woman-heart-woman','family','man-woman-boy','man-woman-girl','man-woman-girl-boy','man-woman-boy-boy','man-woman-girl-girl','man-man-boy','man-man-girl','man-man-girl-boy','man-man-boy-boy','man-man-girl-girl','woman-woman-boy','woman-woman-girl','woman-woman-girl-boy','woman-woman-boy-boy','woman-woman-girl-girl','man-boy','man-boy-boy','man-girl','man-girl-boy','man-girl-girl','woman-boy','woman-boy-boy','woman-girl','woman-girl-boy','woman-girl-girl','speaking_head_in_silhouette','bust_in_silhouette','busts_in_silhouette','people_hugging','footprints','smiley_cat','smile_cat','joy_cat','heart_eyes_cat','smirk_cat','kissing_cat','scream_cat','crying_cat_face','pouting_cat','see_no_evil','hear_no_evil','speak_no_evil','kiss','love_letter','cupid','gift_heart','sparkling_heart','heartpulse','heartbeat','revolving_hearts','two_hearts','heart_decoration','heavy_heart_exclamation_mark_ornament','broken_heart','heart_on_fire','mending_heart','heart','orange_heart','yellow_heart','green_heart','blue_heart','purple_heart','brown_heart','black_heart','white_heart','100','anger','boom','dizzy','sweat_drops','dash','hole','bomb','speech_balloon','eye-in-speech-bubble','left_speech_bubble','right_anger_bubble','thought_balloon','zzz','monkey_face','monkey','gorilla','orangutan','dog','dog2','guide_dog','service_dog','poodle','wolf','fox_face','raccoon','cat','cat2','black_cat','lion_face','tiger','tiger2','leopard','horse','racehorse','unicorn_face','zebra_face','deer','bison','cow','ox','water_buffalo','cow2','pig','pig2','boar','pig_nose','ram','sheep','goat','dromedary_camel','camel','llama','giraffe_face','elephant','mammoth','rhinoceros','hippopotamus','mouse','mouse2','rat','hamster','rabbit','rabbit2','chipmunk','beaver','hedgehog','bat','bear','polar_bear','koala','panda_face','sloth','otter','skunk','kangaroo','badger','feet','turkey','chicken','rooster','hatching_chick','baby_chick','hatched_chick','bird','penguin','dove_of_peace','eagle','duck','swan','owl','dodo','feather','flamingo','peacock','parrot','frog','crocodile','turtle','lizard','snake','dragon_face','dragon','sauropod','t-rex','whale','whale2','dolphin','seal','fish','tropical_fish','blowfish','shark','octopus','shell','coral','snail','butterfly','bug','ant','bee','beetle','ladybug','cricket','cockroach','spider','spider_web','scorpion','mosquito','fly','worm','microbe','bouquet','cherry_blossom','white_flower','lotus','rosette','rose','wilted_flower','hibiscus','sunflower','blossom','tulip','seedling','potted_plant','evergreen_tree','deciduous_tree','palm_tree','cactus','ear_of_rice','herb','shamrock','four_leaf_clover','maple_leaf','fallen_leaf','leaves','empty_nest','nest_with_eggs','grapes','melon','watermelon','tangerine','lemon','banana','pineapple','mango','apple','green_apple','pear','peach','cherries','strawberry','blueberries','kiwifruit','tomato','olive','coconut','avocado','eggplant','potato','carrot','corn','hot_pepper','bell_pepper','cucumber','leafy_green','broccoli','garlic','onion','mushroom','peanuts','beans','chestnut','bread','croissant','baguette_bread','flatbread','pretzel','bagel','pancakes','waffle','cheese_wedge','meat_on_bone','poultry_leg','cut_of_meat','bacon','hamburger','fries','pizza','hotdog','sandwich','taco','burrito','tamale','stuffed_flatbread','falafel','egg','fried_egg','shallow_pan_of_food','stew','fondue','bowl_with_spoon','green_salad','popcorn','butter','salt','canned_food','bento','rice_cracker','rice_ball','rice','curry','ramen','spaghetti','sweet_potato','oden','sushi','fried_shrimp','fish_cake','moon_cake','dango','dumpling','fortune_cookie','takeout_box','crab','lobster','shrimp','squid','oyster','icecream','shaved_ice','ice_cream','doughnut','cookie','birthday','cake','cupcake','pie','chocolate_bar','candy','lollipop','custard','honey_pot','baby_bottle','glass_of_milk','coffee','teapot','tea','sake','champagne','wine_glass','cocktail','tropical_drink','beer','beers','clinking_glasses','tumbler_glass','pouring_liquid','cup_with_straw','bubble_tea','beverage_box','mate_drink','ice_cube','chopsticks','knife_fork_plate','fork_and_knife','spoon','hocho','jar','amphora','jack_o_lantern','christmas_tree','fireworks','sparkler','firecracker','sparkles','balloon','tada','confetti_ball','tanabata_tree','bamboo','dolls','flags','wind_chime','rice_scene','red_envelope','ribbon','gift','reminder_ribbon','admission_tickets','ticket','medal','trophy','sports_medal','first_place_medal','second_place_medal','third_place_medal','soccer','baseball','softball','basketball','volleyball','football','rugby_football','tennis','flying_disc','bowling','cricket_bat_and_ball','field_hockey_stick_and_ball','ice_hockey_stick_and_puck','lacrosse','table_tennis_paddle_and_ball','badminton_racquet_and_shuttlecock','boxing_glove','martial_arts_uniform','goal_net','golf','ice_skate','fishing_pole_and_fish','diving_mask','running_shirt_with_sash','ski','sled','curling_stone','dart','yo-yo','kite','8ball','crystal_ball','magic_wand','nazar_amulet','hamsa','video_game','joystick','slot_machine','game_die','jigsaw','teddy_bear','pinata','mirror_ball','nesting_dolls','spades','hearts','diamonds','clubs','chess_pawn','black_joker','mahjong','flower_playing_cards','performing_arts','frame_with_picture','art','thread','sewing_needle','yarn','knot','earth_africa','earth_americas','earth_asia','globe_with_meridians','world_map','japan','compass','snow_capped_mountain','mountain','volcano','mount_fuji','camping','beach_with_umbrella','desert','desert_island','national_park','stadium','classical_building','building_construction','bricks','rock','wood','hut','house_buildings','derelict_house_building','house','house_with_garden','office','post_office','european_post_office','hospital','bank','hotel','love_hotel','convenience_store','school','department_store','factory','japanese_castle','european_castle','wedding','tokyo_tower','statue_of_liberty','church','mosque','hindu_temple','synagogue','shinto_shrine','kaaba','fountain','tent','foggy','night_with_stars','cityscape','sunrise_over_mountains','sunrise','city_sunset','city_sunrise','bridge_at_night','hotsprings','carousel_horse','playground_slide','ferris_wheel','roller_coaster','barber','circus_tent','steam_locomotive','railway_car','bullettrain_side','bullettrain_front','train2','metro','light_rail','station','tram','monorail','mountain_railway','train','bus','oncoming_bus','trolleybus','minibus','ambulance','fire_engine','police_car','oncoming_police_car','taxi','oncoming_taxi','car','oncoming_automobile','blue_car','pickup_truck','truck','articulated_lorry','tractor','racing_car','racing_motorcycle','motor_scooter','manual_wheelchair','motorized_wheelchair','auto_rickshaw','bike','scooter','skateboard','roller_skate','busstop','motorway','railway_track','oil_drum','fuelpump','wheel','rotating_light','traffic_light','vertical_traffic_light','octagonal_sign','construction','anchor','ring_buoy','boat','canoe','speedboat','passenger_ship','ferry','motor_boat','ship','airplane','small_airplane','airplane_departure','airplane_arriving','parachute','seat','helicopter','suspension_railway','mountain_cableway','aerial_tramway','satellite','rocket','flying_saucer','bellhop_bell','luggage','hourglass','hourglass_flowing_sand','watch','alarm_clock','stopwatch','timer_clock','mantelpiece_clock','clock12','clock1230','clock1','clock130','clock2','clock230','clock3','clock330','clock4','clock430','clock5','clock530','clock6','clock630','clock7','clock730','clock8','clock830','clock9','clock930','clock10','clock1030','clock11','clock1130','new_moon','waxing_crescent_moon','first_quarter_moon','moon','full_moon','waning_gibbous_moon','last_quarter_moon','waning_crescent_moon','crescent_moon','new_moon_with_face','first_quarter_moon_with_face','last_quarter_moon_with_face','thermometer','sunny','full_moon_with_face','sun_with_face','ringed_planet','star','star2','stars','milky_way','cloud','partly_sunny','thunder_cloud_and_rain','mostly_sunny','barely_sunny','partly_sunny_rain','rain_cloud','snow_cloud','lightning','tornado','fog','wind_blowing_face','cyclone','rainbow','closed_umbrella','umbrella','umbrella_with_rain_drops','umbrella_on_ground','zap','snowflake','snowman','snowman_without_snow','comet','fire','droplet','ocean','eyeglasses','dark_sunglasses','goggles','lab_coat','safety_vest','necktie','shirt','jeans','scarf','gloves','coat','socks','dress','kimono','sari','one-piece_swimsuit','briefs','shorts','bikini','womans_clothes','purse','handbag','pouch','shopping_bags','school_satchel','thong_sandal','mans_shoe','athletic_shoe','hiking_boot','womans_flat_shoe','high_heel','sandal','ballet_shoes','boot','crown','womans_hat','tophat','mortar_board','billed_cap','military_helmet','helmet_with_white_cross','prayer_beads','lipstick','ring','gem','mute','speaker','sound','loud_sound','loudspeaker','mega','postal_horn','bell','no_bell','musical_score','musical_note','notes','studio_microphone','level_slider','control_knobs','microphone','headphones','radio','saxophone','accordion','guitar','musical_keyboard','trumpet','violin','banjo','drum_with_drumsticks','long_drum','iphone','calling','phone','telephone_receiver','pager','fax','battery','low_battery','electric_plug','computer','desktop_computer','printer','keyboard','three_button_mouse','trackball','minidisc','floppy_disk','cd','dvd','abacus','movie_camera','film_frames','film_projector','clapper','tv','camera','camera_with_flash','video_camera','vhs','mag','mag_right','candle','bulb','flashlight','izakaya_lantern','diya_lamp','notebook_with_decorative_cover','closed_book','book','green_book','blue_book','orange_book','books','notebook','ledger','page_with_curl','scroll','page_facing_up','newspaper','rolled_up_newspaper','bookmark_tabs','bookmark','label','moneybag','coin','yen','dollar','euro','pound','money_with_wings','credit_card','receipt','chart','email','e-mail','incoming_envelope','envelope_with_arrow','outbox_tray','inbox_tray','package','mailbox','mailbox_closed','mailbox_with_mail','mailbox_with_no_mail','postbox','ballot_box_with_ballot','pencil2','black_nib','lower_left_fountain_pen','lower_left_ballpoint_pen','lower_left_paintbrush','lower_left_crayon','memo','briefcase','file_folder','open_file_folder','card_index_dividers','date','calendar','spiral_note_pad','spiral_calendar_pad','card_index','chart_with_upwards_trend','chart_with_downwards_trend','bar_chart','clipboard','pushpin','round_pushpin','paperclip','linked_paperclips','straight_ruler','triangular_ruler','scissors','card_file_box','file_cabinet','wastebasket','lock','unlock','lock_with_ink_pen','closed_lock_with_key','key','old_key','hammer','axe','pick','hammer_and_pick','hammer_and_wrench','dagger_knife','crossed_swords','gun','boomerang','bow_and_arrow','shield','carpentry_saw','wrench','screwdriver','nut_and_bolt','gear','compression','scales','probing_cane','link','chains','hook','toolbox','magnet','ladder','alembic','test_tube','petri_dish','dna','microscope','telescope','satellite_antenna','syringe','drop_of_blood','pill','adhesive_bandage','crutch','stethoscope','x-ray','door','elevator','mirror','window','bed','couch_and_lamp','chair','toilet','plunger','shower','bathtub','mouse_trap','razor','lotion_bottle','safety_pin','broom','basket','roll_of_paper','bucket','soap','bubbles','toothbrush','sponge','fire_extinguisher','shopping_trolley','smoking','coffin','headstone','funeral_urn','moyai','placard','identification_card'];
/// Return an emoji from an address in a deterministic way
export const getAddressEmoji = (address: string): string => {
    const index = parseInt(address, 16) % emojiNames.length;
    const key = emojiNames[index];
    const emoji = (emojiData as any).emojis[key];
    return emoji.skins[0].native;
}

/// Return a CSS color from an address in a deterministic way
export function getAddressColor(address: string, offset: number, bright=false): string {
    if (!bright) {
        // Any color will do
        return '#' + address.slice(offset, offset+6);
    }
    // Only bright colors
    let red = parseInt( address.slice(offset, offset+2), 16 );
    let green = parseInt( address.slice(offset+2, offset+4), 16 );
    let blue = parseInt( address.slice(offset+4, offset+6), 16 );
    let min_val = 127;
    if (red < min_val)   { red   = 255 - red; }
    if (green < min_val) { green = 255 - green; }
    if (blue < min_val)  { blue  = 255 - blue; }
    return `rgb(${red}, ${green}, ${blue})`;
}

export function shorten(text: string, start: number, end: number, separator: string): string {
    return !text ? '' : text.slice(0, start) + separator + (end?text.slice(-end):'')
}

/// Transform an address like '0x123456789abc' into '@89abc'
export function shortenAddress(address: string): string {
    return '@' + shorten(address, 0, 5, '');
}

/// Get a date in relative time, e.g. "5 days ago"
/// Copied and modified from sui/apps/explorer/src/utils/timeUtils.ts
export function timeAgo(
    epochMilliSecs: number | null | undefined,
    timeNow?: number,
    shortenTimeLabel: boolean = true
): string {
    if (!epochMilliSecs) return '';

    timeNow = timeNow ? timeNow : Date.now();

    const timeLabel = {
        year: {
            full: 'year',
            short: 'y',
        },
        month: {
            full: 'month',
            short: 'm',
        },
        day: {
            full: 'day',
            short: 'd',
        },
        hour: {
            full: 'hour',
            short: 'h',
        },
        min: {
            full: 'min',
            short: 'm',
        },
        sec: {
            full: 'sec',
            short: 's',
        },
    };
    const dateKeyType = shortenTimeLabel ? 'short' : 'full';

    let timeUnit: [string, number][];
    let timeCol = timeNow - epochMilliSecs;

    if (timeCol >= 1000 * 60 * 60 * 24 * 7) { // over a week ago
        timeUnit = [
            [timeLabel.day[dateKeyType], 1000 * 60 * 60 * 24],
        ];
    } else if (timeCol >= 1000 * 60 * 60 * 24) { // over a day ago
        timeUnit = [
            [timeLabel.day[dateKeyType], 1000 * 60 * 60 * 24],
            [timeLabel.hour[dateKeyType], 1000 * 60 * 60],
        ];
    } else if (timeCol >= 1000 * 60 * 60) { // over an hour ago
        timeUnit = [
            [timeLabel.hour[dateKeyType], 1000 * 60 * 60],
            [timeLabel.min[dateKeyType], 1000 * 60],
        ];
    } else if (timeCol >= 1000 * 60) { // over a minute ago
        timeUnit = [
            [timeLabel.min[dateKeyType], 1000 * 60],
        ];
    } else { // less than a minute ago
        timeUnit = [
            [timeLabel.sec[dateKeyType], 1000],
        ];
    }

    const convertAmount = (amount: number, label: string) => {
        const spacing = shortenTimeLabel ? '' : ' ';
        if (amount > 1)
            return `${amount}${spacing}${label}${!shortenTimeLabel ? 's' : ''}`;
        if (amount === 1) return `${amount}${spacing}${label}`;
        return '';
    };

    const resultArr = timeUnit.map(([label, denom]) => {
        const whole = Math.floor(timeCol / denom);
        timeCol = timeCol - whole * denom;
        return convertAmount(whole, label);
    });

    const result = resultArr.join(' ').trim();

    return result ? result : `< 1s`;
};
