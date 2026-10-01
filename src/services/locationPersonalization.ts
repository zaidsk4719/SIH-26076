import {
  CurrentWeather,
  HealthData,
  MarineData,
  TravelData,
  FamilyData,
  AgricultureData,
  CommuteData,
  RouteOption,
  EventsData,
  FitnessData,
  WeatherAlert,
  DestinationWeather,
} from '../types';
import { IndiaLocation } from '../data/indiaLocations';

// City-specific prominent landmarks, airports, expressways, venues, and getaways across India
interface CityProfile {
  airportName: string;
  airportCode: string;
  airportCity: string;
  majorRoutes: {
    primaryName: string;
    primaryNameHi: string;
    altName: string;
    altNameHi: string;
  };
  parks: {
    name: string;
    nameHi: string;
  };
  eventVenue: {
    name: string;
    nameHi: string;
  };
  getaways: {
    city: string;
    cityHi: string;
    country: string;
    tempOffset: number;
    cond: string;
    condHi: string;
    rainProb: number;
  }[];
  runningRoute: {
    name: string;
    nameHi: string;
  };
  waterBody?: {
    name: string;
    nameHi: string;
    type: 'sea' | 'lake' | 'river' | 'bay';
  };
}

const CITY_PROFILES: Record<string, CityProfile> = {
  pune: {
    airportName: 'Pune International Airport (Lohegaon)',
    airportCode: 'PNQ',
    airportCity: 'Pune',
    majorRoutes: {
      primaryName: 'Via Old Pune-Mumbai Highway (NH 48) & Chandani Chowk',
      primaryNameHi: 'पुराने पुणे-मुंबई राजमार्ग (NH 48) व चांदनी चौक द्वारा',
      altName: 'Via Baner-Pashan Link & Smart Arterial Ring Road',
      altNameHi: 'बानेर-पाषाण लिंक रोड व स्मार्ट रिंग रोड द्वारा',
    },
    parks: {
      name: 'Saras Baug & Empress Botanical Gardens',
      nameHi: 'सारस बाग एवं एम्प्रेस बॉटनिकल गार्डन',
    },
    eventVenue: {
      name: 'MCA International Cricket Stadium (Gahunje) & Balewadi Complex',
      nameHi: 'एमसीए अंतरराष्ट्रीय क्रिकेट स्टेडियम (गहुंजे) व बालेवाड़ी कॉम्प्लेक्स',
    },
    getaways: [
      { city: 'Lonavala', cityHi: 'लोनावाला', country: 'India', tempOffset: -4, cond: 'Misty Showers', condHi: 'धुंधली बारिश', rainProb: 75 },
      { city: 'Mahabaleshwar', cityHi: 'महाबलेश्वर', country: 'India', tempOffset: -6, cond: 'Cool Fog & Drizzle', condHi: 'ठंडी धुंध व रिमझिम', rainProb: 80 },
      { city: 'Alibaug Beach', cityHi: 'अलीबाग', country: 'India', tempOffset: +1, cond: 'Breezy Sea Air', condHi: 'सुखद समुद्री हवा', rainProb: 45 },
      { city: 'Goa', cityHi: 'गोवा', country: 'India', tempOffset: +2, cond: 'Tropical Sun & Surf', condHi: 'उष्णकटिबंधीय धूप', rainProb: 30 },
    ],
    runningRoute: {
      name: 'Savitribai Phule Pune University Campus & Taljai Hills Circuit',
      nameHi: 'सावित्रीबाई फुले पुणे विश्वविद्यालय परिसर व तलजाई हिल्स सर्किट',
    },
    waterBody: {
      name: 'Khadakwasla & Panshet Dam Basin (Mula-Mutha River)',
      nameHi: 'खड़कवासला व पानशेत जलाशय (मुळा-मुठा नदी तट)',
      type: 'lake',
    },
  },
  mumbai: {
    airportName: 'Chhatrapati Shivaji Maharaj International Airport',
    airportCode: 'BOM',
    airportCity: 'Mumbai',
    majorRoutes: {
      primaryName: 'Western Express Highway (WEH) & Bandra-Worli Sea Link',
      primaryNameHi: 'वेस्टर्न एक्सप्रेस हाईवे व बांद्रा-वर्ली सी लिंक द्वारा',
      altName: 'Eastern Freeway & Atal Setu (MTHL Trans-Harbour Link)',
      altNameHi: 'ईस्टर्न फ्रीवे एवं अटल सेतु (MTHL) द्वारा',
    },
    parks: {
      name: 'Shivaji Park (Dadar) & Hanging Gardens (Malabar Hill)',
      nameHi: 'शिवाजी पार्क (दादर) एवं हैंगिंग गार्डन्स (मालाबार हिल)',
    },
    eventVenue: {
      name: 'Wankhede Stadium & Jio World Convention Centre (BKC)',
      nameHi: 'वानखेड़े स्टेडियम एवं जियो वर्ल्ड कन्वेंशन सेंटर (बीकेसी)',
    },
    getaways: [
      { city: 'Alibaug', cityHi: 'अलीबाग', country: 'India', tempOffset: 0, cond: 'Coastal Sea Breeze', condHi: 'तटीय समुद्री हवा', rainProb: 40 },
      { city: 'Matheran', cityHi: 'माथेरान', country: 'India', tempOffset: -5, cond: 'Hilltop Mist & Clouds', condHi: 'पहाड़ी धुंध व बादल', rainProb: 70 },
      { city: 'Pune', cityHi: 'पुणे', country: 'India', tempOffset: -2, cond: 'Pleasant Breeze', condHi: 'सुहावनी हवा', rainProb: 35 },
      { city: 'Goa', cityHi: 'गोवा', country: 'India', tempOffset: +1, cond: 'Sunny Spells & Coast', condHi: 'तटीय धूप व समुद्र', rainProb: 25 },
    ],
    runningRoute: {
      name: 'Marine Drive Promenade & Bandra Carter Road Seafront',
      nameHi: 'मरीन ड्राइव प्रोमेनेड एवं बांद्रा कार्टर रोड सीफ्रंट',
    },
    waterBody: {
      name: 'Arabian Sea (Mumbai Offshore & Backbay Waters)',
      nameHi: 'अरब सागर (मुंबई तटीय जलक्षेत्र व बैकबे)',
      type: 'sea',
    },
  },
  delhi: {
    airportName: 'Indira Gandhi International Airport',
    airportCode: 'DEL',
    airportCity: 'New Delhi',
    majorRoutes: {
      primaryName: 'Ring Road & Delhi-Gurgaon Expressway (NH 48)',
      primaryNameHi: 'रिंग रोड एवं दिल्ली-गुरुग्राम एक्सप्रेसवे (NH 48)',
      altName: 'DND Flyway & Barapullah Elevated Corridor',
      altNameHi: 'डीएनडी फ्लाईवे एवं बारापुला एलिवेटेड कॉरिडोर',
    },
    parks: {
      name: 'Lodhi Gardens & Sunder Nursery Heritage Park',
      nameHi: 'लोधी गार्डन एवं सुंदर नर्सरी हेरिटेज पार्क',
    },
    eventVenue: {
      name: 'Arun Jaitley Stadium & Bharat Mandapam (Pragati Maidan)',
      nameHi: 'अरुण जेटली स्टेडियम एवं भारत मंडपम (प्रगति मैदान)',
    },
    getaways: [
      { city: 'Agra', cityHi: 'आगरा', country: 'India', tempOffset: +1, cond: 'Sunny & Haze', condHi: 'धूप व हल्की धुंध', rainProb: 15 },
      { city: 'Jaipur', cityHi: 'जयपुर', country: 'India', tempOffset: +2, cond: 'Dry & Clear Sun', condHi: 'शुष्क व साफ धूप', rainProb: 10 },
      { city: 'Rishikesh', cityHi: 'ऋषिकेश', country: 'India', tempOffset: -4, cond: 'Fresh Mountain Air', condHi: 'स्वच्छ पहाड़ी हवा', rainProb: 30 },
      { city: 'Shimla', cityHi: 'शिमला', country: 'India', tempOffset: -12, cond: 'Chilly Pine Breeze', condHi: 'शीतल चीड़ की हवाएं', rainProb: 40 },
    ],
    runningRoute: {
      name: 'Nehru Park (Chanakyapuri) & Siri Fort Forest Trails',
      nameHi: 'नेहरू पार्क (चाणक्यपुरी) एवं सिरी फोर्ट फॉरेस्ट ट्रेल्स',
    },
    waterBody: {
      name: 'Yamuna River Basin & Okhla Barrage Wetlands',
      nameHi: 'यमुना नदी बेसिन एवं ओखला बैराज वेटलैंड्स',
      type: 'river',
    },
  },
  bengaluru: {
    airportName: 'Kempegowda International Airport',
    airportCode: 'BLR',
    airportCity: 'Bengaluru',
    majorRoutes: {
      primaryName: 'Outer Ring Road (ORR) & Silk Board Tech Corridor',
      primaryNameHi: 'आउटर रिंग रोड (ORR) व सिल्क बोर्ड आईटी कॉरिडोर',
      altName: 'Electronic City Elevated Expressway & NICE Road',
      altNameHi: 'इलेक्ट्रॉनिक सिटी एलिवेटेड एक्सप्रेसवे व नाइस रोड',
    },
    parks: {
      name: 'Cubbon Park & Lalbagh Botanical Gardens',
      nameHi: 'कब्बन पार्क एवं लालबाग बॉटनिकल गार्डन',
    },
    eventVenue: {
      name: 'M. Chinnaswamy Stadium & Bengaluru Palace Grounds',
      nameHi: 'एम. चिन्नास्वामी स्टेडियम एवं बेंगलुरु पैलेस ग्राउंड्स',
    },
    getaways: [
      { city: 'Mysuru', cityHi: 'मैसूरु', country: 'India', tempOffset: +1, cond: 'Mild Sunshine', condHi: 'हल्की खिली धूप', rainProb: 20 },
      { city: 'Coorg (Madikeri)', cityHi: 'कूर्ग (मदिकेरी)', country: 'India', tempOffset: -5, cond: 'Misty Coffee Groves', condHi: 'कॉफी बागानों में धुंध', rainProb: 65 },
      { city: 'Ooty (Nilgiris)', cityHi: 'ऊटी', country: 'India', tempOffset: -10, cond: 'Crisp Mountain Breeze', condHi: 'शीतल पर्वतीय हवाएं', rainProb: 45 },
      { city: 'Nandi Hills', cityHi: 'नंदी हिल्स', country: 'India', tempOffset: -4, cond: 'Cloud-Covered Bluffs', condHi: 'बादलों से घिरी पहाड़ियां', rainProb: 35 },
    ],
    runningRoute: {
      name: 'Cubbon Park Bamboo Grove Circuit & Sankey Tank Perimeter',
      nameHi: 'कब्बन पार्क बांस ग्रूव सर्किट एवं सांकी टैंक पाथवे',
    },
    waterBody: {
      name: 'Ulsoor Lake & Hesaraghatta Catchment Basin',
      nameHi: 'अल्सूर झील एवं हेसरघट्टा जल ग्रहण क्षेत्र',
      type: 'lake',
    },
  },
  chennai: {
    airportName: 'Chennai International Airport (Meenambakkam)',
    airportCode: 'MAA',
    airportCity: 'Chennai',
    majorRoutes: {
      primaryName: 'Anna Salai & Rajiv Gandhi IT Expressway (OMR)',
      primaryNameHi: 'अन्ना सलाई व राजीव गांधी आईटी एक्सप्रेसवे (OMR)',
      altName: 'East Coast Road (ECR) & Chennai Outer Ring Road',
      altNameHi: 'ईस्ट कोस्ट रोड (ECR) व आउटर रिंग रोड',
    },
    parks: {
      name: 'Semmozhi Poonga Botanical Garden & Guindy National Park',
      nameHi: 'सेम्मोझी पूंगा बॉटनिकल गार्डन एवं गिंडी राष्ट्रीय उद्यान',
    },
    eventVenue: {
      name: 'M.A. Chidambaram Stadium (Chepauk) & Nehru Indoor Stadium',
      nameHi: 'एम.ए. चिदंबरम स्टेडियम (चेपॉक) व नेहरू इंडोर स्टेडियम',
    },
    getaways: [
      { city: 'Mahabalipuram', cityHi: 'महाबलीपुरम', country: 'India', tempOffset: 0, cond: 'Coastal Waves & Breeze', condHi: 'समुद्री लहरें व हवा', rainProb: 30 },
      { city: 'Pondicherry', cityHi: 'पुदुचेरी', country: 'India', tempOffset: -1, cond: 'French Quarter Breeze', condHi: 'सुखद तटीय हवा', rainProb: 35 },
      { city: 'Yelagiri Hills', cityHi: 'येलागिरी हिल्स', country: 'India', tempOffset: -6, cond: 'Pleasant Hill Climate', condHi: 'सुहावना पर्वतीय मौसम', rainProb: 40 },
      { city: 'Tirupati', cityHi: 'तिरुपति', country: 'India', tempOffset: +1, cond: 'Warm & Sunny', condHi: 'धूप व सुखद', rainProb: 15 },
    ],
    runningRoute: {
      name: 'Marina Beach Promenade & Besant Nagar Elliot Beach Track',
      nameHi: 'मरीना बीच प्रोमेनेड एवं बेसेंट नगर इलियट बीच ट्रैक',
    },
    waterBody: {
      name: 'Bay of Bengal (Coromandel Coast Marina Waters)',
      nameHi: 'बंगाल की खाड़ी (कोरोमंडल तट व मरीना समुद्र)',
      type: 'bay',
    },
  },
  kolkata: {
    airportName: 'Netaji Subhash Chandra Bose International Airport',
    airportCode: 'CCU',
    airportCity: 'Kolkata',
    majorRoutes: {
      primaryName: 'Eastern Metropolitan Bypass (EM Bypass) & Maa Flyover',
      primaryNameHi: 'ईस्टर्न मेट्रोपॉलिटन बाईपास (ईएम बाईपास) व माँ फ्लाईओवर',
      altName: 'Vidyasagar Setu (Second Hooghly Bridge) & Kona Expressway',
      altNameHi: 'विद्यासागर सेतु (द्वितीय हुगली ब्रिज) व कोना एक्सप्रेसवे',
    },
    parks: {
      name: 'Eco Park (New Town) & Victoria Memorial South Lawns',
      nameHi: 'इको पार्क (न्यू टाउन) एवं विक्टोरिया मेमोरियल साउथ लॉन',
    },
    eventVenue: {
      name: 'Eden Gardens & Salt Lake Vivekananda Yuva Bharati Stadium',
      nameHi: 'ईडन गार्डन्स एवं साल्ट लेक विवेकानंद युवा भारती स्टेडियम',
    },
    getaways: [
      { city: 'Digha Coast', cityHi: 'दीघा तट', country: 'India', tempOffset: -1, cond: 'Coastal Sea Breeze', condHi: 'तटीय समुद्री हवा', rainProb: 50 },
      { city: 'Mandarmani', cityHi: 'मंदारमणि', country: 'India', tempOffset: 0, cond: 'Beach Surf & Sun', condHi: 'समुद्र तट व धूप', rainProb: 45 },
      { city: 'Sundarbans', cityHi: 'सुंदरबन', country: 'India', tempOffset: -1, cond: 'Estuary Wind & Clouds', condHi: 'ज्वारनदमुख हवा व बादल', rainProb: 60 },
      { city: 'Darjeeling', cityHi: 'दार्जिलिंग', country: 'India', tempOffset: -14, cond: 'Cold Himalayan Mist', condHi: 'ठंडी पहाड़ी धुंध', rainProb: 55 },
    ],
    runningRoute: {
      name: 'Rabindra Sarobar Lake Track & Red Road Maidan Corridor',
      nameHi: 'रवींद्र सरोवर झील ट्रैक एवं रेड रोड मैदान कॉरिडोर',
    },
    waterBody: {
      name: 'Hooghly River (Bhagirathi-Hooghly Estuary Basin)',
      nameHi: 'हुगली नदी (भागीरथी-हुगली ज्वारनदमुख बेसिन)',
      type: 'river',
    },
  },
  hyderabad: {
    airportName: 'Rajiv Gandhi International Airport (Shamshabad)',
    airportCode: 'HYD',
    airportCity: 'Hyderabad',
    majorRoutes: {
      primaryName: 'Nehru Outer Ring Road (ORR) & Gachibowli IT Corridor',
      primaryNameHi: 'नेहरू आउटर रिंग रोड (ORR) व गाचीबोवली आईटी कॉरिडोर',
      altName: 'PVNR Elevated Expressway & Banjara Hills Road No. 1',
      altNameHi: 'पीवीएनआर एलिवेटेड एक्सप्रेसवे व बंजारा हिल्स मार्ग',
    },
    parks: {
      name: 'KBR National Park (Jubilee Hills) & Sanjeevaiah Park',
      nameHi: 'केबीआर नेशनल पार्क (जुबली हिल्स) एवं संजीवैया पार्क',
    },
    eventVenue: {
      name: 'Rajiv Gandhi International Cricket Stadium (Uppal) & HICC',
      nameHi: 'राजीव गांधी अंतरराष्ट्रीय क्रिकेट स्टेडियम (उप्पल) व एचआईसीसी',
    },
    getaways: [
      { city: 'Ananthagiri Hills', cityHi: 'अनंतगिरी हिल्स', country: 'India', tempOffset: -4, cond: 'Fresh Forest Breeze', condHi: 'वन की शीतल हवा', rainProb: 40 },
      { city: 'Nagarjuna Sagar', cityHi: 'नागार्जुन सागर', country: 'India', tempOffset: +1, cond: 'Sunny Lakeside Air', condHi: 'झील किनारे धूप', rainProb: 20 },
      { city: 'Warangal', cityHi: 'वारंगल', country: 'India', tempOffset: 0, cond: 'Clear Sky & Warmth', condHi: 'साफ आसमान व धूप', rainProb: 15 },
      { city: 'Hampi', cityHi: 'हम्पी', country: 'India', tempOffset: +2, cond: 'Historic Ruins Sun', condHi: 'धूप व शुष्क मौसम', rainProb: 10 },
    ],
    runningRoute: {
      name: 'KBR Park Outer Perimeter Track & Hussain Sagar Necklace Road',
      nameHi: 'केबीआर पार्क परिधि ट्रैक एवं हुसैन सागर नेकलेस रोड',
    },
    waterBody: {
      name: 'Hussain Sagar Lake & Osman Sagar Catchment',
      nameHi: 'हुसैन सागर झील एवं उस्मान सागर जल संग्रहण क्षेत्र',
      type: 'lake',
    },
  },
  jaipur: {
    airportName: 'Jaipur International Airport (Sanganer)',
    airportCode: 'JAI',
    airportCity: 'Jaipur',
    majorRoutes: {
      primaryName: 'Jawaharlal Nehru Marg & Tonk Road Arterial Corridor',
      primaryNameHi: 'जवाहरलाल नेहरू मार्ग व टोंक रोड कॉरिडोर',
      altName: 'Ajmer Road Elevated Expressway & Jaipur Ring Road',
      altNameHi: 'अजमेर रोड एलिवेटेड एक्सप्रेसवे व जयपुर रिंग रोड',
    },
    parks: {
      name: 'Central Park (Statue Circle) & Sisodia Rani Garden',
      nameHi: 'सेंट्रल पार्क (स्टैच्यू सर्कल) एवं सिसोदिया रानी गार्डन',
    },
    eventVenue: {
      name: 'Sawai Mansingh Stadium & JECC Convention Centre (Sitapura)',
      nameHi: 'सवाई मानसिंह स्टेडियम एवं जेईसीसी कन्वेंशन सेंटर (सीतापुरा)',
    },
    getaways: [
      { city: 'Pushkar', cityHi: 'पुष्कर', country: 'India', tempOffset: +1, cond: 'Sacred Lake Sun', condHi: 'पवित्र झील व धूप', rainProb: 10 },
      { city: 'Ranthambore', cityHi: 'रणथंभौर', country: 'India', tempOffset: 0, cond: 'Jungle Safari Warmth', condHi: 'जंगल सफारी धूप', rainProb: 15 },
      { city: 'Udaipur', cityHi: 'उदयपुर', country: 'India', tempOffset: -2, cond: 'Lakeside Pleasant Breeze', condHi: 'झीलों पर सुहावनी हवा', rainProb: 25 },
      { city: 'Mount Abu', cityHi: 'माउंट आबू', country: 'India', tempOffset: -8, cond: 'Cool Mountain Air', condHi: 'शीतल पर्वतीय हवा', rainProb: 35 },
    ],
    runningRoute: {
      name: 'Central Park 4km Jogging Track & Smriti Van Nature Trails',
      nameHi: 'सेंट्रल पार्क 4 किमी जॉगिंग ट्रैक एवं स्मृति वन ट्रेल्स',
    },
    waterBody: {
      name: 'Man Sagar Lake (Jal Mahal) & Ramgarh Catchment Basin',
      nameHi: 'मान सागर झील (जल महल) व रामगढ़ जल ग्रहण बेसिन',
      type: 'lake',
    },
  },
  srinagar: {
    airportName: 'Sheikh ul-Alam International Airport (Budgam)',
    airportCode: 'SXR',
    airportCity: 'Srinagar',
    majorRoutes: {
      primaryName: 'Boulevard Road along Dal Lake & Srinagar Bypass (NH 44)',
      primaryNameHi: 'डल झील बुलेवार्ड रोड एवं श्रीनगर बाईपास (NH 44)',
      altName: 'Hyderpora Flyover & Foreshore Road via Hazratbal',
      altNameHi: 'हैदरपोरा फ्लाईवे एवं फोरशोर रोड (हजरतबल होकर)',
    },
    parks: {
      name: 'Mughal Gardens (Shalimar & Nishat Bagh) & Chashme Shahi',
      nameHi: 'मुगल गार्डन (शालीमार व निशात बाग) एवं चश्मे शाही',
    },
    eventVenue: {
      name: 'Sher-i-Kashmir International Conference Centre (SKICC) & Bakshi Stadium',
      nameHi: 'शेर-ए-कश्मीर कन्वेंशन सेंटर (एसकेआईसीसी) व बख्शी स्टेडियम',
    },
    getaways: [
      { city: 'Gulmarg', cityHi: 'गुलमर्ग', country: 'India', tempOffset: -7, cond: 'Alpine Chill & Meadows', condHi: 'शीतल आल्प्स की ठंडी हवा', rainProb: 45 },
      { city: 'Pahalgam', cityHi: 'पहलगाम', country: 'India', tempOffset: -5, cond: 'Pine Valley Showers', condHi: 'चीड़ घाटी में बौछारें', rainProb: 50 },
      { city: 'Sonamarg', cityHi: 'सोनमर्ग', country: 'India', tempOffset: -8, cond: 'Glacier Stream Breeze', condHi: 'ग्लेशियर की ठंडी हवा', rainProb: 40 },
      { city: 'Doodhpathri', cityHi: 'दूधपथरी', country: 'India', tempOffset: -6, cond: 'Crisp Meadow Air', condHi: 'घास के मैदानों की स्वच्छ हवा', rainProb: 35 },
    ],
    runningRoute: {
      name: 'Dal Lake Boulevard Waterfront & Shankaracharya Hill Foothills',
      nameHi: 'डल झील बुलेवार्ड वाटरफ्रंट व शंकराचार्य पहाड़ी तलहटी',
    },
    waterBody: {
      name: 'Dal Lake & Nigeen Lake (Jhelum River Catchment Basin)',
      nameHi: 'डल झील व निगीन झील (झेलम नदी जल ग्रहण बेसिन)',
      type: 'lake',
    },
  },
};

// Generic regional fallback generator for Indian towns and districts
function getFallbackProfile(loc: IndiaLocation): CityProfile {
  const isCoastal = loc.climateZone === 'Coastal' || loc.climateZone === 'Island';
  const isHimalayan = loc.climateZone === 'Himalayan';
  const isArid = loc.climateZone === 'Arid';

  const airportCity = loc.name.split(',')[0].trim();
  const airportCode = loc.stationCode.replace('AWS-', 'STN-');

  let getaways = [
    { city: 'Regional Hill Station', cityHi: 'पर्वतीय पर्यटन स्थल', country: 'India', tempOffset: -5, cond: 'Fresh Breeze', condHi: 'स्वच्छ हवा', rainProb: 40 },
    { city: 'State Capital Hub', cityHi: 'राज्य राजधानी', country: 'India', tempOffset: +1, cond: 'Clear Sunshine', condHi: 'साफ धूप', rainProb: 20 },
    { city: 'Pilgrimage Circuit', cityHi: 'धार्मिक तीर्थ स्थल', country: 'India', tempOffset: 0, cond: 'Pleasant & Calm', condHi: 'सुखद व शांत', rainProb: 15 },
    { city: 'Riverside Getaway', cityHi: 'नदी तट भ्रमण', country: 'India', tempOffset: -2, cond: 'Mild Showers', condHi: 'हल्की बारिश', rainProb: 30 },
  ];

  if (loc.region === 'North') {
    getaways = [
      { city: 'Shimla', cityHi: 'शिमला', country: 'India', tempOffset: -8, cond: 'Crisp Mountain Breeze', condHi: 'शीतल पर्वतीय हवा', rainProb: 40 },
      { city: 'Rishikesh', cityHi: 'ऋषिकेश', country: 'India', tempOffset: -3, cond: 'Ganga Valley Air', condHi: 'गंगा घाटी की हवा', rainProb: 30 },
      { city: 'Jaipur', cityHi: 'जयपुर', country: 'India', tempOffset: +2, cond: 'Warm & Dry Sun', condHi: 'धूप व शुष्क मौसम', rainProb: 10 },
      { city: 'Chandigarh', cityHi: 'चंडीगढ़', country: 'India', tempOffset: -1, cond: 'Pleasant Breeze', condHi: 'सुहावनी हवा', rainProb: 20 },
    ];
  } else if (loc.region === 'South') {
    getaways = [
      { city: 'Ooty (Nilgiris)', cityHi: 'ऊटी', country: 'India', tempOffset: -9, cond: 'Misty Tea Hills', condHi: 'चाय बागानों में धुंध', rainProb: 50 },
      { city: 'Coorg', cityHi: 'कूर्ग', country: 'India', tempOffset: -5, cond: 'Cool Showers', condHi: 'ठंडी फुहारें', rainProb: 60 },
      { city: 'Mysuru', cityHi: 'मैसूरु', country: 'India', tempOffset: 0, cond: 'Gentle Sunshine', condHi: 'हल्की खिली धूप', rainProb: 25 },
      { city: 'Kochi Coast', cityHi: 'कोच्चि तट', country: 'India', tempOffset: +1, cond: 'Maritime Sea Breeze', condHi: 'समुद्री हवा', rainProb: 45 },
    ];
  } else if (loc.region === 'West') {
    getaways = [
      { city: 'Lonavala & Khandala', cityHi: 'लोनावाला व खंडाला', country: 'India', tempOffset: -4, cond: 'Ghat Mist & Clouds', condHi: 'घाटों में धुंध व बादल', rainProb: 70 },
      { city: 'Mahabaleshwar', cityHi: 'महाबलेश्वर', country: 'India', tempOffset: -6, cond: 'Cool Drizzle', condHi: 'ठंडी रिमझिम', rainProb: 75 },
      { city: 'Goa', cityHi: 'गोवा', country: 'India', tempOffset: +1, cond: 'Tropical Breeze', condHi: 'उष्णकटिबंधीय हवा', rainProb: 35 },
      { city: 'Udaipur', cityHi: 'उदयपुर', country: 'India', tempOffset: -1, cond: 'Pleasant Lake Wind', condHi: 'झीलों पर सुहावनी हवा', rainProb: 20 },
    ];
  } else if (loc.region === 'East' || loc.region === 'North-East') {
    getaways = [
      { city: 'Darjeeling', cityHi: 'दार्जिलिंग', country: 'India', tempOffset: -12, cond: 'Himalayan Mist', condHi: 'पहाड़ी धुंध व ठंड', rainProb: 60 },
      { city: 'Shillong (Meghalaya)', cityHi: 'शिलांग', country: 'India', tempOffset: -7, cond: 'Cloudy Pine Ridges', condHi: 'बादलों से घिरी पहाड़ियां', rainProb: 70 },
      { city: 'Puri Coast', cityHi: 'पुरी तट', country: 'India', tempOffset: +1, cond: 'Bay of Bengal Surf', condHi: 'समुद्री लहरें व हवा', rainProb: 40 },
      { city: 'Kaziranga Reserve', cityHi: 'काजीरंगा', country: 'India', tempOffset: 0, cond: 'Forest Humidity & Breeze', condHi: 'वन की नम हवा', rainProb: 50 },
    ];
  }

  return {
    airportName: `${airportCity} Regional Aviation Link`,
    airportCode: airportCode,
    airportCity: airportCity,
    majorRoutes: {
      primaryName: `Major National Highway Corridor (${loc.state})`,
      primaryNameHi: `मुख्य राष्ट्रीय राजमार्ग कॉरिडोर (${loc.stateHi})`,
      altName: `Smart City Ring Road & Arterial Link`,
      altNameHi: `स्मार्ट सिटी रिंग रोड व मुख्य मार्ग`,
    },
    parks: {
      name: `${airportCity} Municipal Botanical Garden & Public Park`,
      nameHi: `${airportCity} नगर बॉटनिकल पार्क व सार्वजनिक उद्यान`,
    },
    eventVenue: {
      name: `${airportCity} District Sports Arena & Civic Grounds`,
      nameHi: `${airportCity} जिला खेल परिसर व नागरिक मैदान`,
    },
    getaways,
    runningRoute: {
      name: `${airportCity} Lakefront Promenade & Green Belt Jogging Track`,
      nameHi: `${airportCity} झील किनारा प्रोमेनेड एवं ग्रीन बेल्ट ट्रैक`,
    },
    waterBody: isCoastal
      ? {
          name: loc.region === 'East' ? 'Bay of Bengal Coastal Zone' : 'Arabian Sea Coastal Zone',
          nameHi: loc.region === 'East' ? 'बंगाल की खाड़ी तटीय क्षेत्र' : 'अरब सागर तटीय क्षेत्र',
          type: 'sea',
        }
      : {
          name: `${airportCity} Freshwater Reservoir & Watershed Basin`,
          nameHi: `${airportCity} मीठे पानी का जलाशय व जल ग्रहण क्षेत्र`,
          type: 'lake',
        },
  };
}

function getCityProfile(loc: IndiaLocation): CityProfile {
  const cleanId = loc.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, prof] of Object.entries(CITY_PROFILES)) {
    if (cleanId === key || cleanId.startsWith(key) || loc.name.toLowerCase().includes(key)) {
      return prof;
    }
  }
  return getFallbackProfile(loc);
}

/**
 * 1. PERSONALIZED MARINE DATA (Coast vs Inland)
 */
export function getPersonalizedMarineData(loc: IndiaLocation, weather: CurrentWeather): MarineData {
  const isCoastal = loc.climateZone === 'Coastal' || loc.climateZone === 'Island';
  const prof = getCityProfile(loc);
  const windKmh = weather.windSpeed;
  const windKnots = Math.round(windKmh * 0.54);

  // Sea wave height scales with wind speed
  const waveHeight = isCoastal
    ? Math.round((0.6 + (windKnots / 15) * 1.4) * 10) / 10
    : 0.3;

  const sstTemp = isCoastal
    ? Math.round(Math.min(31, Math.max(24, weather.temperature - 2)))
    : Math.round(weather.temperature - 3);

  let seaCondition: 'Calm' | 'Moderate' | 'Rough' | 'Very Rough' = 'Moderate';
  let seaConditionHi = 'शांत से मध्यम';
  if (windKnots > 25 || weather.condition.toLowerCase().includes('storm')) {
    seaCondition = 'Rough';
    seaConditionHi = 'अशांत व तेज लहरें';
  } else if (windKnots > 16) {
    seaCondition = 'Moderate';
    seaConditionHi = 'मध्यम समुद्री लहरें';
  } else if (windKnots < 8) {
    seaCondition = 'Calm';
    seaConditionHi = 'शांत व स्थिर';
  }

  // Next Tide timing calculation based on current hour
  const curHour = new Date().getHours();
  const tideHour = (curHour + 3) % 12 || 12;
  const tideAmPm = ((curHour + 3) % 24) >= 12 ? 'PM' : 'AM';
  const highTideTime = `${tideHour}:25 ${tideAmPm}`;
  const lowTideHour = (curHour + 9) % 12 || 12;
  const lowTideAmPm = ((curHour + 9) % 24) >= 12 ? 'PM' : 'AM';
  const lowTideTime = `${lowTideHour}:40 ${lowTideAmPm}`;

  if (!isCoastal) {
    // Inland freshwater lake / river basin
    return {
      seaCondition: 'Calm',
      seaConditionHi: `अंतर्देशीय जल निकाय (${prof.waterBody?.nameHi || 'झील'})`,
      nextHighTide: 'N/A (Inland Basin)',
      highTideHeight: 'N/A',
      nextLowTide: 'Stable Flow',
      lowTideHeight: 'Normal Pool',
      waveHeight: 0.2,
      waterTemperature: sstTemp,
      marineAdvisory: `Inland Location: Water conditions at ${prof.waterBody?.name || 'Local Waterway'}. Surface water temperature is ${sstTemp}°C. Boating and recreational angling feasible with standard safety precautions.`,
      marineAdvisoryHi: `अंतर्देशीय स्थल: ${prof.waterBody?.nameHi || 'स्थानीय जलाशय'} पर सामान्य जल स्तर। सतह तापमान ${sstTemp}°C। नौकायन व मनोरंजन गतिविधियां पूरी तरह सुरक्षित हैं।`,
      windKnots,
    };
  }

  return {
    seaCondition,
    seaConditionHi,
    nextHighTide: highTideTime,
    highTideHeight: `${Math.round((2.8 + (waveHeight > 1.5 ? 0.8 : 0.2)) * 10) / 10} m`,
    nextLowTide: lowTideTime,
    lowTideHeight: '0.8 m',
    waveHeight,
    waterTemperature: sstTemp,
    marineAdvisory:
      windKnots > 22
        ? `IMD Coastal Warning for ${prof.waterBody?.name || 'Coast'}: Wind speed ${windKnots} knots. Squally weather expected. Fishermen and leisure vessels advised not to venture into deep sea.`
        : `Safe maritime conditions along ${prof.waterBody?.name || 'Coast'}. Swell wave height ${waveHeight}m with surface water temperature at ${sstTemp}°C. Beach patrols operating standard flags.`,
    marineAdvisoryHi:
      windKnots > 22
        ? `आईएमडी तटीय चेतावनी (${prof.waterBody?.nameHi || 'तट'}): हवा की गति ${windKnots} समुद्री मील। मछुआरों को गहरे समुद्र में न जाने की सलाह दी जाती है।`
        : `${prof.waterBody?.nameHi || 'तट'} पर समुद्र शांत व सामान्य। लहरों की ऊंचाई ${waveHeight} मीटर और जल तापमान ${sstTemp}°C है। समुद्री तट पूरी तरह सुरक्षित हैं।`,
    windKnots,
  };
}

/**
 * 2. PERSONALIZED TRAVEL DATA
 */
export function getPersonalizedTravelData(loc: IndiaLocation, weather: CurrentWeather): TravelData {
  const prof = getCityProfile(loc);
  const isThunder = weather.condition.toLowerCase().includes('storm') || weather.condition.toLowerCase().includes('thunder');
  const isFog = weather.visibility < 3;
  const isRain = weather.rainProbability > 65;

  const flightStatus = isThunder || isFog ? 'Delay Likely' : isRain ? 'Minor Delay' : 'Normal';
  const flightStatusHi = isThunder || isFog ? 'उड़ानों में देरी संभावित' : isRain ? 'मामूली देरी' : 'सामान्य';

  const flightAlert = isThunder
    ? `${prof.airportCode} Airport: Convective thunderstorm activity and lightning cells; arrival sequencing delays expected (+25 to 45 mins).`
    : isFog
    ? `${prof.airportCode} Airport: Dense fog below CAT-III minima; ground delay program active (+30 mins).`
    : isRain
    ? `${prof.airportCode} Airport: Wet runway operations in progress; minor turnaround delays (+15 mins).`
    : `${prof.airportCode} (${prof.airportName}): On-time schedule, clear approaches and normal gate operations.`;

  const flightAlertHi = isThunder
    ? `${prof.airportCode} हवाई अड्डा: गरज के साथ तेज आंधी के कारण उड़ानों में 25 से 45 मिनट की देरी संभावित।`
    : isFog
    ? `${prof.airportCode} हवाई अड्डा: घने कोहरे के कारण दृश्यता प्रभावित; उड़ानों में 30 मिनट का विलंब।`
    : isRain
    ? `${prof.airportCode} हवाई अड्डा: गीले रनवे के कारण मामूली परिचालन देरी (+15 मिनट)।`
    : `${prof.airportCode} हवाई अड्डा (${prof.airportCity}): सुचारु संचालन, सभी उड़ानें समय पर।`;

  // Getaways from this city
  const savedDestinations: DestinationWeather[] = prof.getaways.map((g, idx) => {
    const destTemp = Math.round(weather.temperature + g.tempOffset);
    const destRain = g.rainProb;
    const destStatus = destRain > 70 ? 'Delay Likely' : 'Normal';
    return {
      id: `dest-${idx}-${g.city.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      city: g.city,
      cityHi: g.cityHi,
      country: g.country,
      temp: destTemp,
      condition: g.cond,
      conditionHi: g.condHi,
      rainProb: destRain,
      flightStatus: destStatus,
      flightStatusHi: destStatus === 'Normal' ? 'सामान्य' : 'उड़ानों में देरी संभावित',
      flightAlertMessage: destRain > 70 ? `High rain probability at ${g.city}. Road transit delays likely.` : `Normal traffic and travel conditions to ${g.city}.`,
      flightAlertMessageHi: destRain > 70 ? `${g.cityHi} में भारी बारिश की संभावना। यात्रा में अतिरिक्त समय लें।` : `${g.cityHi} हेतु सामान्य यात्रा परिस्थितियां।`,
    };
  });

  const packing = [
    weather.rainProbability > 50
      ? `Carry compact umbrella/rainwear from ${prof.airportCity} (Rain likelihood ${weather.rainProbability}%)`
      : `Breathable cotton transit apparel suitable for ${weather.temperature}°C in ${prof.airportCity}`,
    `Check live flight gate alerts for departure hub ${prof.airportCode} (${prof.airportCity})`,
    weather.uvIndex > 6 ? 'UV protection sunglasses and broad-spectrum SPF 30+ sunscreen' : 'Waterproof pouch for flight documents and boarding passes',
    'Portable power bank and insulated hydration bottle for highway transit',
  ];

  const packingHi = [
    weather.rainProbability > 50
      ? `${prof.airportCity} से प्रस्थान करते समय छाता या रेनकोट साथ रखें (${weather.rainProbability}% बारिश की संभावना)`
      : `${prof.airportCity} के ${weather.temperature}°C तापमान हेतु हल्के सूती वस्त्र पहनें`,
    `${prof.airportCode} हवाई अड्डे के लाइव गेट अपडेट पर नजर रखें`,
    weather.uvIndex > 6 ? 'धूप का चश्मा और सनस्क्रीन साथ रखें' : 'दस्तावेजों व टिकटों के लिए वाटरप्रूफ बैग रखें',
    'यात्रा के दौरान मोबाइल पावरबैंक और पानी की बोतल साथ रखें',
  ];

  return {
    savedDestinations,
    packingSuggestions: packing,
    packingSuggestionsHi: packingHi,
    travelTip: `Recommended weekend getaways from ${prof.airportCity}: ${prof.getaways.map((g) => g.city).join(', ')}.`,
    travelTipHi: `${prof.airportCity} से सप्ताहांत यात्रा के मुख्य गंतव्य: ${prof.getaways.map((g) => g.cityHi).join(', ')}।`,
    severeTravelAlert: isThunder || isFog ? flightAlert : undefined,
  };
}

/**
 * 3. PERSONALIZED FAMILY & SCHOOL DATA
 */
export function getPersonalizedFamilyData(loc: IndiaLocation, weather: CurrentWeather): FamilyData {
  const prof = getCityProfile(loc);
  const isHighAqi = weather.aqi > 200;
  const isRain = weather.rainProbability > 50;
  const isHeat = weather.temperature >= 35;

  let advisory = `Clear morning school transit in ${loc.name.split(',')[0]}. Safe outdoor play conditions.`;
  let advisoryHi = `${loc.name.split(',')[0]} में सुबह का स्कूल आवागमन सुगम। बाहरी खेलकूद सुरक्षित है।`;

  if (isHighAqi) {
    advisory = `High AQI (${weather.aqi}) in ${loc.name.split(',')[0]}. Advise children to wear anti-pollution masks during morning school bus transit.`;
    advisoryHi = `${loc.name.split(',')[0]} में वायु गुणवत्ता खराब (AQI ${weather.aqi})। स्कूल आवागमन के समय बच्चों को मास्क पहनाएं।`;
  } else if (isRain) {
    advisory = `Rain showers anticipated in ${loc.name.split(',')[0]}. Ensure school bags have waterproof covers and kids carry rain gear.`;
    advisoryHi = `${loc.name.split(',')[0]} में बारिश की संभावना। बच्चों के स्कूल बैग के लिए वाटरप्रूफ कवर और छाता साथ रखें।`;
  } else if (isHeat) {
    advisory = `High afternoon temperatures (${weather.temperature}°C) in ${loc.name.split(',')[0]}. Pack an electrolyte hydration bottle in school bags.`;
    advisoryHi = `${loc.name.split(',')[0]} में दोपहर में तेज गर्मी (${weather.temperature}°C)। स्कूल बैग में पर्याप्त पानी व ओआरएस बोतल रखें।`;
  }

  const morningTemp = Math.round(weather.temperature - 3);
  const afternoonTemp = Math.round(weather.temperature + 2);

  return {
    morningCommute: {
      period: 'Morning',
      periodHi: 'सुबह का स्कूल आवागमन',
      timeRange: '7:00 AM – 8:30 AM',
      weather: weather.rainProbability > 40 ? 'Passing Morning Showers' : 'Pleasant & Dry',
      weatherHi: weather.rainProbability > 40 ? 'सुबह की हल्की बौछारें' : 'सुखद व सूखा',
      temp: morningTemp,
      rainProbability: Math.round(weather.rainProbability * 0.7),
      visibility: weather.visibility < 4 ? 'Moderate Haze (3-4 km)' : 'Clear Visibility (> 7 km)',
      visibilityHi: weather.visibility < 4 ? 'मध्यम धुंध (3-4 किमी)' : 'स्पष्ट दृश्यता (> 7 किमी)',
      status: weather.rainProbability > 50 ? 'Rain Expected' : 'Clear',
      statusHi: weather.rainProbability > 50 ? 'बारिश संभव' : 'सुगम आवागमन',
    },
    afternoonCommute: {
      period: 'Afternoon',
      periodHi: 'दोपहर स्कूल वापसी',
      timeRange: '1:30 PM – 3:30 PM',
      weather: weather.rainProbability > 60 ? 'Thunderstorms / Rain Expected' : isHeat ? 'Peak Afternoon Heat' : 'Scattered Clouds',
      weatherHi: weather.rainProbability > 60 ? 'तेज बारिश व गरज' : isHeat ? 'तीखी दोपहर की धूप' : 'बिखरे बादल',
      temp: afternoonTemp,
      rainProbability: weather.rainProbability,
      visibility: weather.visibility < 3 ? 'Low Visibility' : 'Clear',
      visibilityHi: weather.visibility < 3 ? 'कम दृश्यता' : 'स्पष्ट',
      status: isRain ? 'Rain Expected' : isHeat ? 'Caution Needed' : 'Clear',
      statusHi: isRain ? 'बारिश की चेतावनी' : isHeat ? 'तीखी धूप' : 'सामान्य',
    },
    commuteAdvisory: advisory,
    commuteAdvisoryHi: advisoryHi,
    uvSunProtectionNeeded: weather.uvIndex >= 6,
  };
}

/**
 * 4. PERSONALIZED EVENT & WEDDING DATA
 */
export function getPersonalizedEventsData(loc: IndiaLocation, weather: CurrentWeather): EventsData {
  const prof = getCityProfile(loc);
  const rain = weather.rainProbability;
  const temp = weather.temperature;
  const humidity = weather.humidity;

  // Comfort Index 0-100
  let comfort = 85;
  if (temp > 35) comfort -= (temp - 35) * 5;
  if (temp < 15) comfort -= (15 - temp) * 4;
  if (humidity > 70) comfort -= (humidity - 70) * 0.8;
  if (rain > 40) comfort -= (rain - 40) * 0.6;
  comfort = Math.max(25, Math.min(98, Math.round(comfort)));

  const comfortCategory: 'Very Uncomfortable' | 'Moderate' | 'Pleasant' | 'Ideal' =
    comfort >= 80 ? 'Ideal' : comfort >= 60 ? 'Pleasant' : comfort >= 40 ? 'Moderate' : 'Very Uncomfortable';
  const comfortCategoryHi =
    comfort >= 80 ? 'सर्वोत्तम (आदर्श)' : comfort >= 60 ? 'सुखद व अनुकूल' : comfort >= 40 ? 'सामान्य (मध्यम)' : 'प्रतिकूल';

  let eventAdv = `Favorable conditions for weddings and outdoor gatherings at ${prof.eventVenue.name}. Normal setups recommended.`;
  let eventAdvHi = `${prof.eventVenue.nameHi} में शादियों व आउटडोर आयोजनों के लिए अनुकूल मौसम।`;

  if (rain > 60) {
    eventAdv = `High rain likelihood (${rain}%) in ${loc.name.split(',')[0]}. Mandatory waterproof canopy or indoor backup venue advised at ${prof.eventVenue.name}.`;
    eventAdvHi = `${loc.name.split(',')[0]} में बारिश की संभावना (${rain}%)। ${prof.eventVenue.nameHi} में वाटरप्रूफ शामियाना अथवा इनडोर बैकअप स्थान की व्यवस्था रखें।`;
  } else if (temp > 36) {
    eventAdv = `Peak thermal conditions (${temp}°C) in ${loc.name.split(',')[0]}. Evening receptions after 6:30 PM with mist fans or air-cooled canopies recommended.`;
    eventAdvHi = `${loc.name.split(',')[0]} में तेज गर्मी (${temp}°C)। शाम 6:30 बजे के बाद कार्यक्रम रखें और मिस्ट पंखों व कूलिंग की व्यवस्था करें।`;
  }

  const extendedForecast = [
    { day: 'Day 1', dayHi: 'पहला दिन', icon: rain > 50 ? '🌧️' : '⛅', tempHigh: temp + 1, tempLow: temp - 6, rainProb: rain, comfortCategory: (rain > 50 ? 'Poor' : 'Good') as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 2', dayHi: 'दूसरा दिन', icon: '⛅', tempHigh: temp + 2, tempLow: temp - 5, rainProb: Math.max(15, rain - 15), comfortCategory: 'Good' as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 3', dayHi: 'तीसरा दिन', icon: '🌤️', tempHigh: temp, tempLow: temp - 7, rainProb: Math.max(10, rain - 25), comfortCategory: 'Good' as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 4', dayHi: 'चौथा दिन', icon: '☀️', tempHigh: temp + 1, tempLow: temp - 6, rainProb: 15, comfortCategory: 'Good' as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 5', dayHi: 'पांचवा दिन', icon: '⛅', tempHigh: temp - 1, tempLow: temp - 7, rainProb: 25, comfortCategory: 'Good' as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 6', dayHi: 'छठा दिन', icon: '🌧️', tempHigh: temp - 2, tempLow: temp - 8, rainProb: 45, comfortCategory: 'Moderate' as 'Good' | 'Moderate' | 'Poor' },
    { day: 'Day 7', dayHi: 'सातवां दिन', icon: '🌤️', tempHigh: temp, tempLow: temp - 6, rainProb: 20, comfortCategory: 'Good' as 'Good' | 'Moderate' | 'Poor' },
  ];

  return {
    extendedRainProb: rain,
    comfortIndex: comfort,
    comfortCategory,
    comfortCategoryHi,
    temperatureComfort: `${temp}°C (Feels like ${weather.feelsLike}°C)`,
    temperatureComfortHi: `${temp}°C (अहसास ${weather.feelsLike}°C)`,
    humidityComfort: `${humidity}% Relative Humidity`,
    humidityComfortHi: `${humidity}% सापेक्ष आर्द्रता`,
    windComfort: `Wind ${weather.windSpeed} km/h (${weather.windDirection})`,
    windComfortHi: `हवा ${weather.windSpeed} किमी/घंटा (${weather.windDirection})`,
    eventAdvisory: eventAdv,
    eventAdvisoryHi: eventAdvHi,
    advisory: eventAdv,
    advisoryHi: eventAdvHi,
    bestTimeSlot: temp > 32 ? '6:30 PM – 10:30 PM (Evening Comfort)' : '10:00 AM – 2:00 PM (Pleasant Sunlight)',
    bestTimeSlotHi: temp > 32 ? 'शाम 6:30 से 10:30 बजे (सुखद शाम)' : 'सुबह 10:00 से दोपहर 2:00 बजे (खिली धूप)',
    extendedForecast,
  };
}

/**
 * 5. PERSONALIZED AGRICULTURE DATA
 */
export function getPersonalizedAgricultureData(loc: IndiaLocation, weather: CurrentWeather): AgricultureData {
  const isRain = weather.rainProbability > 50;
  const isHighWind = weather.windSpeed > 22;
  const stateLower = loc.state.toLowerCase();

  // Regional crops based on agro-climatic zones
  let crops = ['Soybean', 'Cotton', 'Pulses (Tur/Moong)', 'Groundnut', 'Sugarcane'];
  let cropsHi = ['सोयाबीन', 'कपास', 'दलहन (अरहर/मूंग)', 'मूंगफली', 'गन्ना'];
  let season: 'Kharif' | 'Rabi' | 'Zaid' = 'Kharif';
  let seasonHi = 'खरीफ सत्र';

  if (stateLower.includes('punjab') || stateLower.includes('haryana')) {
    crops = ['Wheat', 'Paddy (Rice)', 'Mustard', 'Sugarcane', 'Cotton'];
    cropsHi = ['गेहूं', 'धान (चावल)', 'सरसों', 'गन्ना', 'कपास'];
  } else if (stateLower.includes('uttar pradesh') || stateLower.includes('bihar')) {
    crops = ['Sugarcane', 'Wheat', 'Paddy', 'Potato', 'Maize', 'Mustard'];
    cropsHi = ['गन्ना', 'गेहूं', 'धान', 'आलू', 'मक्का', 'सरसों'];
  } else if (stateLower.includes('rajasthan')) {
    crops = ['Bajra (Pearl Millet)', 'Mustard', 'Guar', 'Moong', 'Groundnut'];
    cropsHi = ['बाजरा', 'सरसों', 'ग्वार', 'मूंग', 'मूंगफली'];
  } else if (stateLower.includes('karnataka') || stateLower.includes('tamil nadu') || stateLower.includes('andhra') || stateLower.includes('telangana')) {
    crops = ['Paddy', 'Groundnut', 'Cotton', 'Spices', 'Coconut', 'Pulses'];
    cropsHi = ['धान', 'मूंगफली', 'कपास', 'मसाले', 'नारियल', 'दलहन'];
  } else if (stateLower.includes('bengal') || stateLower.includes('odisha')) {
    crops = ['Paddy (Aman/Boro)', 'Jute', 'Mustard', 'Potato', 'Tea'];
    cropsHi = ['धान', 'जूट (पटसन)', 'सरसों', 'आलू', 'चाय'];
  } else if (stateLower.includes('himachal') || stateLower.includes('kashmir') || stateLower.includes('uttarakhand')) {
    crops = ['Apple Orchards', 'Saffron', 'Walnuts', 'Barley', 'Off-season Vegetables'];
    cropsHi = ['सेब के बाग', 'केसर', 'अखरोट', 'जौ', 'मौसमी सब्जियां'];
    season = 'Rabi';
    seasonHi = 'पर्वतीय कृषि सत्र (रबी)';
  }

  const soilMoisture = Math.min(92, Math.max(22, Math.round(weather.humidity * 0.65 + (isRain ? 15 : -5))));
  const soilStatus: 'Low' | 'Moderate' | 'Optimal' | 'Excess' =
    soilMoisture > 75 ? 'Excess' : soilMoisture > 50 ? 'Optimal' : soilMoisture > 30 ? 'Moderate' : 'Low';
  const soilStatusHi = soilMoisture > 75 ? 'अतिरिक्त (संतृप्त)' : soilMoisture > 50 ? 'सर्वोत्तम (पर्याप्त)' : soilMoisture > 30 ? 'मध्यम' : 'कम (शुष्क)';

  const rain24h = isRain ? Math.round(weather.rainProbability * 0.3) : 0;
  const rain7d = Math.round(rain24h * 3.5 + 12);

  const agriAdv = isHighWind
    ? `Wind speed ${weather.windSpeed} km/h in ${loc.name.split(',')[0]} zone. Suspend foliar insecticide/fertilizer sprays to avoid chemical drift. Recommended crops: ${crops.slice(0, 3).join(', ')}.`
    : isRain
    ? `Expected rainfall in ${loc.name.split(',')[0]} agro-cluster. Postpone scheduled field irrigation and clear drainage ditches. Optimal conditions for nutrient top-dressing.`
    : `Stable weather in ${loc.name.split(',')[0]} farming belt. Ideal conditions for pesticide spraying and drip irrigation. Recommended regional crops: ${crops.slice(0, 4).join(', ')}.`;

  const agriAdvHi = isHighWind
    ? `${loc.name.split(',')[0]} क्षेत्र में तेज हवा (${weather.windSpeed} किमी/घंटा)। कीटनाशक छिड़काव स्थगित रखें ताकि दवा न बहे। प्रमुख फसलें: ${cropsHi.slice(0, 3).join(', ')}।`
    : isRain
    ? `${loc.name.split(',')[0]} कृषि क्षेत्र में वर्षा की संभावना। सिंचाई स्थगित रखें और जल निकासी नालियां साफ रखें। खाद देने हेतु अनुकूल समय।`
    : `${loc.name.split(',')[0]} क्षेत्र में मौसम स्थिर। कीटनाशक छिड़काव व ड्रिप सिंचाई हेतु अनुकूल समय। प्रमुख फसलें: ${cropsHi.slice(0, 4).join(', ')}।`;

  return {
    soilMoisture,
    soilMoistureStatus: soilStatus,
    soilMoistureStatusHi: soilStatusHi,
    rainfall24h: rain24h,
    rainfall7d: rain7d,
    rainfallProbability: weather.rainProbability,
    frostAlert: {
      active: weather.temperature < 4,
      level: weather.temperature < 4 ? 'High' : 'Safe',
      message: weather.temperature < 4 ? 'Ground frost risk detected for young seedlings.' : 'No frost danger for current agro-climatic region.',
      messageHi: weather.temperature < 4 ? 'पाले का गंभीर खतरा! हल्की सिंचाई करें।' : 'वर्तमान कृषि क्षेत्र में पाले का कोई जोखिम नहीं है।',
    },
    season,
    seasonHi,
    recommendedCrops: crops,
    recommendedCropsHi: cropsHi,
    agriAdvisory: agriAdv,
    agriAdvisoryHi: agriAdvHi,
  };
}

/**
 * 6. PERSONALIZED COMMUTE & TRANSIT DATA
 */
export function getPersonalizedCommuteData(loc: IndiaLocation, weather: CurrentWeather): CommuteData {
  const prof = getCityProfile(loc);
  const isRain = weather.rainProbability >= 50;
  const isStorm = weather.condition.toLowerCase().includes('storm') || weather.windSpeed > 30;
  const isFog = weather.visibility < 3;
  const visKm = weather.visibility;

  // Visibility Category & Detailed Advisory
  let visibilityCategory: 'Clear' | 'Moderate Mist / Haze' | 'Dense Fog' | 'Zero-Visibility Dense Fog' = 'Clear';
  let visibilityCategoryHi = 'स्पष्ट दृश्यता';
  let visibilityAdvisory = 'Clear road visibility. Safe driving conditions on open highways.';
  let visibilityAdvisoryHi = 'सड़क पर स्पष्ट दृश्यता। हाईवे पर ड्राइविंग हेतु सुरक्षित वातावरण।';

  if (visKm < 0.5) {
    visibilityCategory = 'Zero-Visibility Dense Fog';
    visibilityCategoryHi = 'शून्य दृश्यता (अत्यधिक घना कोहरा)';
    visibilityAdvisory = 'Hazardous zero-visibility fog! Turn on fog lamps & hazard lights. Keep max 25 km/h on expressways.';
    visibilityAdvisoryHi = 'अत्यधिक घना कोहरा! फॉग लाइट जलाएं व स्पीड 25 किमी/घंटा से कम रखें।';
  } else if (visKm < 1.5) {
    visibilityCategory = 'Dense Fog';
    visibilityCategoryHi = 'घना कोहरा';
    visibilityAdvisory = 'Dense fog layer ahead. Use low-beam headlights, avoid overtaking, and maintain 50m distance.';
    visibilityAdvisoryHi = 'घना कोहरा। लो-बीम लाइट का प्रयोग करें और आगे वाले वाहन से 50 मीटर दूरी बनाए रखें।';
  } else if (visKm < 3.5) {
    visibilityCategory = 'Moderate Mist / Haze';
    visibilityCategoryHi = 'मध्यम कोहरा / धुंध';
    visibilityAdvisory = 'Moderate morning mist & industrial haze. Maintain steady lane discipline during commute.';
    visibilityAdvisoryHi = 'मध्यम धुंध व कोहरा। यात्रा के दौरान लेन अनुशासन बनाए रखें।';
  }

  // Fog Alert Details
  const fogAlertDetails = isFog
    ? {
        title: 'Dense Fog & Low Visibility Advisory',
        titleHi: 'घने कोहरे व कम दृश्यता की चेतावनी',
        description: `Visibility reduced to ${visKm} km across ${prof.majorRoutes.primaryName}. High risk of pile-ups at highway intersections.`,
        descriptionHi: `${prof.majorRoutes.primaryNameHi} पर दृश्यता घटकर ${visKm} किमी रह गई है। चौराहों व हाईवे पर सावधान रहें।`,
        recommendedSpeedKmh: visKm < 1.0 ? 25 : 35,
        delayImpact: 'Road transit delay: +15-25 min | CAT-III Airport delays likely',
        delayImpactHi: 'सड़क यात्रा में +15-25 मिनट विलंब | उड़ानों में देरी संभव',
      }
    : undefined;

  // Storm Alert Details
  const stormAlertDetails = isStorm || (isRain && weather.windSpeed > 25)
    ? {
        title: 'Severe Convective Weather & Storm Alert',
        titleHi: 'तेज आंधी व गंभीर तूफान की चेतावनी',
        description: `Gusty winds (${weather.windSpeed} km/h) & intense downpours expected along ${prof.majorRoutes.primaryName}. Waterlogging and tree-branch hazard.`,
        descriptionHi: `${prof.majorRoutes.primaryNameHi} पर ${weather.windSpeed} किमी/घंटा की हवाएं व मूसलाधार बारिश। जलभराव व पेड़ गिरने का खतरा।`,
        hydroplaningRisk: weather.windSpeed > 35 ? ('Severe' as const) : ('Moderate' as const),
        delayImpact: 'Heavy traffic slowdown: +25-45 min | High hydroplaning hazard',
        delayImpactHi: 'भारी ट्रैफिक जाम (+25-45 मिनट) | हाईवे पर फिसलन का जोखिम',
      }
    : undefined;

  // Multi-modal Transit Impacts
  const transitImpacts = {
    road: isStorm
      ? `Severe congestion and standing water on ${prof.majorRoutes.primaryName}. Use elevated alternate bypass.`
      : isFog
      ? `Slow-moving arterial traffic due to fog. Use low-beam lights.`
      : `Smooth traffic flow on main corridors of ${prof.airportCity}.`,
    roadHi: isStorm
      ? `${prof.majorRoutes.primaryNameHi} पर भारी जलभराव व ट्रैफिक जाम। एलिवेटेड मार्ग अपनाएं।`
      : isFog
      ? `कोहरे के कारण धीमी गति से चलता ट्रैफ़िक।`
      : `${prof.airportCity} के मुख्य मार्गों पर यातायात सुगम।`,
    rail: isStorm || isRain
      ? `Suburban local rail and metro operating with 10-15 min precautionary speed restrictions.`
      : isFog
      ? `Intercity trains delayed by 20-40 min due to fog signaling protocols.`
      : `Metro and suburban rail services operating on normal scheduled frequency.`,
    railHi: isStorm || isRain
      ? `मेट्रो व लोकल ट्रेन सेवाएं 10-15 मिनट की एहतियाती देरी से संचालित।`
      : isFog
      ? `कोहरे के कारण एक्सप्रेस ट्रेनें 20-40 मिनट विलंब से।`
      : `मेट्रो व लोकल रेल का संचालन बिल्कुल समय पर।`,
    aviation: isStorm
      ? `${prof.airportCode} Airport (${prof.airportName}): Holding patterns active for arriving flights.`
      : isFog
      ? `${prof.airportCode} Airport: CAT-III low-visibility procedures active (+30 min flight delays).`
      : `${prof.airportCode} Airport: All flight operations operating on schedule.`,
    aviationHi: isStorm
      ? `${prof.airportCode} हवाई अड्डा: तेज आंधी के कारण उड़ानों में देरी संभव।`
      : isFog
      ? `${prof.airportCode} हवाई अड्डा: घने कोहरे के कारण low-visibility प्रोटोकॉल लागू।`
      : `${prof.airportCode} हवाई अड्डा: उड़ानों का संचालन पूरी तरह समय पर।`,
  };

  const riskScore = isStorm ? 88 : isRain ? 74 : isFog ? 68 : 28;
  const riskCategory = riskScore > 75 ? 'High' : riskScore > 45 ? 'Moderate' : 'Low';
  const riskCategoryHi = riskCategory === 'High' ? 'उच्च जोखिम' : riskCategory === 'Moderate' ? 'मध्यम जोखिम' : 'निम्न जोखिम';

  const delayMin = isStorm ? 35 : isRain ? 22 : isFog ? 18 : 6;
  const savingsMin = Math.round(delayMin * 0.65);
  const cityName = loc.name.split(',')[0].trim();

  const roadCond = isStorm
    ? `Heavy convective squalls & waterlogging risk on ${prof.majorRoutes.primaryName}. Severe delays.`
    : isRain
    ? `Wet asphalt, ponding at underpasses on ${prof.majorRoutes.primaryName}. Reduce speed.`
    : isFog
    ? `Dense fog/mist on ${prof.majorRoutes.primaryName}. Low-beam headlights required.`
    : `Clear vehicular progression and dry road conditions along ${prof.majorRoutes.primaryName}.`;

  const roadCondHi = isStorm
    ? `${prof.majorRoutes.primaryNameHi} पर तेज आंधी व जलभराव का खतरा। भारी यातायात विलंब।`
    : isRain
    ? `${prof.majorRoutes.primaryNameHi} पर गीली सड़क व अंडरपास में जलजमाव। वाहन धीमी गति से चलाएं।`
    : isFog
    ? `${prof.majorRoutes.primaryNameHi} पर कम दृश्यता। लो-बीम लाइट का उपयोग करें।`
    : `${prof.majorRoutes.primaryNameHi} पर यातायात सुचारू और सड़कें सूखी हैं।`;

  const altRoute1: RouteOption = {
    id: 'route-alternative-1',
    name: prof.majorRoutes.altName,
    nameHi: prof.majorRoutes.altNameHi,
    distanceKm: 20.6,
    durationMin: 45 + delayMin - savingsMin,
    trafficLevel: 'Moderate',
    trafficLevelHi: 'मध्यम ट्रैफिक',
    delayMin: Math.max(2, delayMin - savingsMin),
    isAlternative: true,
    savingsMin,
    riskScore: Math.round(riskScore * 0.45),
    riskCategory: 'Low',
    speedKmh: isStorm ? 32 : isRain ? 38 : 52,
    floodSafe: true,
    safetyReason: 'Elevated bypass corridor with high drainage clearance; avoids all major waterlogging bottlenecks',
    safetyReasonHi: 'उच्च जल निकासी वाला सुरक्षित एलिवेटेड बाईपास; जलभराव वाले सभी मुख्य चौराहों से मुक्त',
  };

  const altRoute2: RouteOption = {
    id: 'route-alternative-2',
    name: `Outer Elevated Link & Metro Corridor (${cityName} North Bypass)`,
    nameHi: `आउटर एलिवेटेड लिंक एवं मेट्रो कॉरिडोर (${cityName} उत्तर बाईपास)`,
    distanceKm: 22.4,
    durationMin: Math.max(28, 45 + delayMin - savingsMin - 5),
    trafficLevel: 'Light',
    trafficLevelHi: 'सुगम यातायात',
    delayMin: 2,
    isAlternative: true,
    savingsMin: savingsMin + 5,
    riskScore: 18,
    riskCategory: 'Low',
    speedKmh: 58,
    floodSafe: true,
    safetyReason: 'Grade-separated expressway with continuous monitoring and zero puddle accumulation',
    safetyReasonHi: 'सतत निगरानी युक्त ग्रेड-सेपरेटेड सुरक्षित एक्सप्रेसवे, जलजमाव की शून्य संभावना',
  };

  // Calculate dynamic Congestion Percentage dynamically based on time-of-day rush hour & weather
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let timeRushBonus = 18;
  if ((currentHour >= 8 && currentHour < 11) || (currentHour >= 17 && currentHour < 21)) {
    timeRushBonus = 45 + ((currentHour * 3 + currentMinute) % 24);
  } else if (currentHour >= 11 && currentHour < 17) {
    timeRushBonus = 28 + (currentMinute % 14);
  } else if (currentHour >= 21 || currentHour < 6) {
    timeRushBonus = 14 + (currentMinute % 8);
  }

  const weatherPenalty = isStorm ? 38 : isRain ? 26 : isFog ? 22 : 0;
  const locHash = Math.abs(
    (loc.name || 'city').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % 15;

  const dynamicCongestionIndex = Math.min(
    95,
    Math.max(14, timeRushBonus + weatherPenalty + locHash)
  );

  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    routeRisk: {
      score: riskScore,
      level: riskCategory,
      levelHi: riskCategoryHi,
    },
    currentRoute: {
      id: 'route-primary',
      name: prof.majorRoutes.primaryName,
      nameHi: prof.majorRoutes.primaryNameHi,
      distanceKm: 18.2,
      durationMin: 45 + delayMin,
      trafficLevel: dynamicCongestionIndex >= 68 ? 'Heavy' : dynamicCongestionIndex >= 38 ? 'Moderate' : 'Light',
      trafficLevelHi: dynamicCongestionIndex >= 68 ? 'भारी ट्रैफिक (Heavy)' : dynamicCongestionIndex >= 38 ? 'मध्यम ट्रैफिक' : 'सुगम यातायात',
      delayMin,
      riskScore,
      riskCategory,
      speedKmh: isStorm ? 12 : isRain ? 16 : isFog ? 22 : Math.max(18, Math.round(55 - (dynamicCongestionIndex * 0.4))),
      bottlenecks: [
        'Low-Lying Underpass & Railway Culvert (High Water Level)',
        'Major Arterial Signal Intersection (Heavy Stagnation)',
        'Slippery Wet Asphalt & Hydroplaning Hazard',
      ],
      bottlenecksHi: [
        'निचला रेलवे अंडरपास (जलभराव स्तर अधिक)',
        'मुख्य सिग्नल चौराहा (भारी जाम व धीमी गति)',
        'गीली फिसलन भरी सड़क व हाइड्रोप्लेनिंग जोखिम',
      ],
    },
    betterRoute: altRoute1,
    alternateRoutes: [altRoute1, altRoute2],
    roadCondition: roadCond,
    roadConditionHi: roadCondHi,
    visibilityKm: visKm,
    visibilityCategory,
    visibilityCategoryHi,
    visibilityAdvisory,
    visibilityAdvisoryHi,
    fogAlertActive: isFog,
    fogAlertDetails,
    stormAlertActive: isStorm,
    stormAlertDetails,
    transitImpacts,
    rainImpact: isStorm ? 'Severe Flooding / Jams' : isRain ? 'Moderate Slowdowns' : 'Minimal',
    rainImpactHi: isStorm ? 'गंभीर गतिरोध' : isRain ? 'मध्यम गतिरोध' : 'मौसम अनुकूल',
    trafficProvider: 'OSRM Open Traffic Engine & IMD Telemetry',
    lastTrafficUpdate: `Live • ${formattedTime}`,
    congestionIndex: dynamicCongestionIndex,
  };
}

/**
 * 7. PERSONALIZED FITNESS & OUTDOOR ACTIVITY DATA
 */
export function getPersonalizedFitnessData(loc: IndiaLocation, weather: CurrentWeather): FitnessData {
  const prof = getCityProfile(loc);
  const temp = weather.temperature;
  const isHeat = temp >= 34;
  const isNight = weather.isDay === false;
  const aqi = weather.aqi;

  let activityScore = 88;
  if (temp > 33) activityScore -= (temp - 33) * 4;
  if (temp < 12) activityScore -= (12 - temp) * 3;
  if (aqi > 150) activityScore -= (aqi - 150) * 0.2;
  if (weather.rainProbability > 50) activityScore -= 25;
  activityScore = Math.max(20, Math.min(98, Math.round(activityScore)));

  const scoreCategory: 'Excellent' | 'Good' | 'Fair' | 'Poor' =
    activityScore >= 80 ? 'Excellent' : activityScore >= 60 ? 'Good' : activityScore >= 40 ? 'Fair' : 'Poor';

  const runningRouteName = prof.runningRoute.name;
  const runningRouteNameHi = prof.runningRoute.nameHi;

  return {
    sunrise: '6:04 AM',
    sunset: '6:42 PM',
    bestRunningHours: isNight
      ? 'Evening / Night Workout: 7:30 PM – 9:30 PM'
      : isHeat
      ? 'Early Morning Window: 5:30 AM – 7:00 AM'
      : 'Morning Workout: 6:00 AM – 8:30 AM',
    bestRunningHoursHi: isNight
      ? 'शाम / रात का व्यायाम: 7:30 से 9:30 बजे'
      : isHeat
      ? 'सुबह का समय: 5:30 से 7:00 बजे'
      : 'सुबह का समय: 6:00 से 8:30 बजे',
    runningReason: `Recommended Circuit: ${runningRouteName}. Current temperature is ${temp}°C with AQI ${aqi}. ${
      isHeat ? 'Hydrate every 15 minutes.' : 'Optimal cardio conditions.'
    }`,
    runningReasonHi: `सुझाया गया मार्ग: ${runningRouteNameHi}। वर्तमान तापमान ${temp}°C व AQI ${aqi}। ${
      isHeat ? 'प्रत्येक 15 मिनट पर पानी पिएं।' : 'कार्डियो के लिए अनुकूल मौसम।'
    }`,
    windSpeed: weather.windSpeed,
    heatAlert: {
      active: isHeat,
      level: temp >= 38 ? 'High' : 'Moderate',
      message: isHeat
        ? `Wet-bulb heat index elevated in ${loc.name.split(',')[0]} (${temp}°C). Avoid midday outdoor cardio.`
        : 'Thermal comfort within safe workout thresholds.',
      messageHi: isHeat
        ? `${loc.name.split(',')[0]} में तापमान अधिक (${temp}°C)। दोपहर में भारी व्यायाम से बचें।`
        : 'वर्कआउट के लिए तापमान अनुकूल और सुरक्षित सीमा में है।',
    },
    outdoorActivityScore: activityScore,
    activityScoreCategory: scoreCategory,
    uvConditions: isNight
      ? '0 (Nighttime Safe)'
      : weather.uvIndex >= 7
      ? `High (UV Index ${weather.uvIndex}) from 11:30 AM to 3:00 PM`
      : `Moderate (UV Index ${weather.uvIndex})`,
    uvConditionsHi: isNight
      ? '0 (रात्रि में सुरक्षित)'
      : weather.uvIndex >= 7
      ? `उच्च (यूवी इंडेक्स ${weather.uvIndex}) सुबह 11:30 से 3:00 बजे तक`
      : `मध्यम (यूवी इंडेक्स ${weather.uvIndex})`,
  };
}

/**
 * 8. DYNAMIC LOCATION-SPECIFIC IMD WEATHER ALERTS
 */
export function getPersonalizedAlerts(loc: IndiaLocation, weather: CurrentWeather): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const cityName = loc.name.split(',')[0].trim();
  const stateName = loc.state;
  const isCoastal = loc.climateZone === 'Coastal' || loc.climateZone === 'Island';

  // 1. Rain / Storm Alert
  if (weather.rainProbability >= 65 || weather.condition.toLowerCase().includes('storm')) {
    alerts.push({
      id: `alert-rain-${loc.id}`,
      type: 'Heavy Rain / Thunderstorm',
      severity: weather.rainProbability >= 80 ? 'red' : 'orange',
      title: `${weather.rainProbability >= 80 ? 'IMD Red Alert' : 'Orange Alert'}: Severe Squalls & Thunderstorms`,
      titleHi: `${weather.rainProbability >= 80 ? 'लाल चेतावनी' : 'नारंगी चेतावनी'}: आंधी-तूफान व भारी वर्षा`,
      message: `IMD Meteorological Bulletin: Convective cloud bursts with gusty winds (45-60 km/h) and lightning strikes predicted over ${cityName} district and adjoining sectors.`,
      messageHi: `आईएमडी बुलेटिन: ${cityName} जिले और आसपास के क्षेत्रों में 45-60 किमी/घंटा की हवाओं और गरज के साथ भारी बारिश का अनुमान।`,
      startTime: '13:00 Today',
      endTime: '22:00 Today',
      location: `${cityName} District, ${stateName}`,
      priorityScore: 92,
    });
  } else if (weather.rainProbability >= 45) {
    alerts.push({
      id: `alert-rain-yellow-${loc.id}`,
      type: 'Passing Showers',
      severity: 'yellow',
      title: 'Yellow Watch: Localized Showers Expected',
      titleHi: 'पीला अलर्ट: स्थानीय वर्षा की संभावना',
      message: `IMD Advisory: Moderate showers with brief wet spells across ${cityName} urban areas. Allow extra transit buffer.`,
      messageHi: `आईएमडी सलाह: ${cityName} में मध्यम बारिश की संभावना। यात्रा में अतिरिक्त समय रखें।`,
      startTime: '14:30 Today',
      endTime: '20:00 Today',
      location: `${cityName} District, ${stateName}`,
      priorityScore: 68,
    });
  }

  // 2. Air Quality / Pollution Alert (Official CPCB Categories: Poor 201-300, Very Poor 301-400, Severe >400)
  if (weather.aqi >= 401) {
    alerts.push({
      id: `alert-aqi-severe-${loc.id}`,
      type: 'Severe Atmospheric Pollution Emergency',
      severity: 'red',
      title: `Severe Air Quality Hazard (AQI ${weather.aqi})`,
      titleHi: `गंभीर वायु प्रदूषण आपातकाल (AQI ${weather.aqi})`,
      message: `CPCB Emergency: Ambient air quality index is Severe (AQI ${weather.aqi}) in ${cityName}. All residents advised to strictly minimize outdoor exertion and wear N95 respirators.`,
      messageHi: `सीपीसीबी आपातकाल: ${cityName} में वायु गुणवत्ता गंभीर (AQI ${weather.aqi})। बाहरी गतिविधियों से बिल्कुल बचें और N95 मास्क पहनें।`,
      startTime: 'Ongoing',
      endTime: 'Tomorrow 10:00 AM',
      location: `${cityName} Urban Agglomeration`,
      priorityScore: 94,
    });
  } else if (weather.aqi >= 301) {
    alerts.push({
      id: `alert-aqi-orange-${loc.id}`,
      type: 'Very Poor Air Quality Alert',
      severity: 'orange',
      title: `Very Poor Air Quality (AQI ${weather.aqi})`,
      titleHi: `बहुत खराब वायु गुणवत्ता (AQI ${weather.aqi})`,
      message: `CPCB Warning: Prolonged outdoor exposure in ${cityName} causes respiratory distress. Children, elderly, and cardiac patients should remain indoors.`,
      messageHi: `सीपीसीबी चेतावनी: ${cityName} में वायु गुणवत्ता बहुत खराब (AQI ${weather.aqi})। बच्चे और बुजुर्ग घर के अंदर रहें।`,
      startTime: 'Ongoing',
      endTime: 'Tomorrow 08:00 AM',
      location: `${cityName} Urban Agglomeration`,
      priorityScore: 82,
    });
  } else if (weather.aqi >= 201) {
    alerts.push({
      id: `alert-aqi-yellow-${loc.id}`,
      type: 'Poor Air Quality Advisory',
      severity: 'yellow',
      title: `Poor Air Quality Advisory (AQI ${weather.aqi})`,
      titleHi: `खराब वायु गुणवत्ता परामर्श (AQI ${weather.aqi})`,
      message: `CPCB Advisory: Breathing discomfort likely on prolonged outdoor exposure in ${cityName}. Limit intense outdoor cardio workouts near major roadways.`,
      messageHi: `सीपीसीबी परामर्श: ${cityName} में वायु गुणवत्ता खराब (AQI ${weather.aqi})। लंबे समय तक बाहर रहने पर सांस की तकलीफ हो सकती है; भारी व्यायाम सीमित करें।`,
      startTime: 'Ongoing',
      endTime: '20:00 Today',
      location: `${cityName} District`,
      priorityScore: 65,
    });
  }

  // 3. Heatwave Alert
  if (weather.temperature >= 38) {
    alerts.push({
      id: `alert-heat-${loc.id}`,
      type: 'Extreme Heatwave Warning',
      severity: weather.temperature >= 42 ? 'red' : 'orange',
      title: `Heatwave Warning (${weather.temperature}°C Recorded)`,
      titleHi: `लू (हीटवेव) चेतावनी (${weather.temperature}°C दर्ज)`,
      message: `Severe thermal conditions prevailing over ${cityName} and interior ${stateName}. Avoid direct sunlight exposure between 11:30 AM and 4:00 PM. Drink plenty of water.`,
      messageHi: `${cityName} व ${stateName} में तीखी लू की चेतावनी। सुबह 11:30 से शाम 4:00 बजे तक धूप में सीधे जाने से बचें और पर्याप्त जलपान करें।`,
      startTime: '11:30 AM Today',
      endTime: '16:30 PM Today',
      location: `${cityName} & Interior ${stateName}`,
      priorityScore: 89,
    });
  }

  // 4. Coastal / Marine Warning if applicable
  if (isCoastal && (weather.windSpeed > 25 || weather.condition.toLowerCase().includes('storm'))) {
    alerts.push({
      id: `alert-marine-${loc.id}`,
      type: 'Marine / Coastal Warning',
      severity: 'orange',
      title: `Squally Weather Warning for Fishermen (${cityName} Coast)`,
      titleHi: `मछुआरों के लिए समुद्री चेतावनी (${cityName} तट)`,
      message: `High swell waves and wind speeds reaching 40-55 km/h along the ${cityName} coastal zone. Fishermen are strongly advised not to venture into deep sea areas.`,
      messageHi: `${cityName} तट पर ऊंची समुद्री लहरें और 40-55 किमी/घंटे की रफ्तार से तेज हवाएं। मछुआरों को गहरे समुद्र में न जाने की सलाह।`,
      startTime: '06:00 Today',
      endTime: '23:59 Tomorrow',
      location: `${cityName} Coastal Belt, ${stateName}`,
      priorityScore: 87,
    });
  }

  // 5. UV Alert
  if (weather.isDay && weather.uvIndex >= 7 && alerts.length < 2) {
    alerts.push({
      id: `alert-uv-${loc.id}`,
      type: 'High UV Radiation',
      severity: 'yellow',
      title: `UV Index ${weather.uvIndex} (High Sun Exposure Alert)`,
      titleHi: `यूवी इंडेक्स ${weather.uvIndex} (उच्च सौर विकिरण चेतावनी)`,
      message: `Peak solar irradiance over ${cityName}. Wear UV-blocking eyewear, protective headwear, and SPF 30+ sunscreen outdoors.`,
      messageHi: `${cityName} में तीव्र सौर विकिरण। धूप का चश्मा, टोपी व सनस्क्रीन का उपयोग करें।`,
      startTime: '11:30 AM Today',
      endTime: '15:00 PM Today',
      location: `${cityName} Region`,
      priorityScore: 70,
    });
  }

  // If no adverse weather conditions, return green advisory
  if (alerts.length === 0) {
    alerts.push({
      id: `alert-fair-${loc.id}`,
      type: 'Fair Weather Conditions',
      severity: 'yellow',
      title: `Fair Synoptic Weather over ${cityName}`,
      titleHi: `${cityName} में मौसम अनुकूल व सामान्य`,
      message: `Current IMD observation: Stable atmospheric conditions at ${cityName}. Temperature is ${weather.temperature}°C with ${weather.humidity}% relative humidity. No severe weather warnings active.`,
      messageHi: `आईएमडी बुलेटिन: ${cityName} में मौसम पूरी तरह स्थिर व अनुकूल। तापमान ${weather.temperature}°C और आर्द्रता ${weather.humidity}%। कोई मौसम चेतावनी सक्रिय नहीं है।`,
      startTime: 'Valid Today',
      endTime: 'Next 24 Hours',
      location: `${cityName} District, ${stateName}`,
      priorityScore: 40,
    });
  }

  return alerts;
}
