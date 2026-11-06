import { useState } from "react"
import {
  Building2,
  Hospital,
  ShieldAlert,
  Landmark,
  Train,
  FileCheck,
  Volume2,
  Mic,
  MicOff,
  Printer,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react"
import ThreeAvatar from "@/components/avatar/ThreeAvatar"
import type { SignGesture } from "@/components/avatar/ThreeAvatar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { Button } from "@/components/ui/button"
import { INDIC_LANGUAGES, speakText, createSpeechRecognizer } from "@/lib/speech"

interface PublicServiceCategory {
  id: string
  title: string
  subtitle: string
  icon: typeof Hospital
  accentColor: string
  bgGlow: string
  borderColor: string
  tokenPrefix: string
  scenarios: {
    id: string
    label: string
    islGloss: string
    gesture: SignGesture
    spokenPhrases: Record<string, string>
    staffPrompt: string
  }[]
}

const PUBLIC_SERVICES: PublicServiceCategory[] = [
  {
    id: "hospital",
    title: "Hospital & Medical OPD",
    subtitle: "Doctor consultation, emergency triage, pharmacy & blood test",
    icon: Hospital,
    accentColor: "text-rose-500",
    bgGlow: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    tokenPrefix: "MED-OPD",
    scenarios: [
      {
        id: "doctor_urgency",
        label: "I need urgent medical attention / doctor",
        islGloss: "ME URGENT DOCTOR NEED",
        gesture: "HELP",
        spokenPhrases: {
          en: "I am deaf. I need urgent medical attention. Please assist me with a doctor.",
          hi: "मैं बधिर हूँ। मुझे तत्काल डॉक्टर की सहायता की आवश्यकता है। कृपया मेरी मदद करें।",
          gu: "હું ડેફ (સાંભળી ન શકનાર) છું. મને તાત્કાલિક ડૉક્ટરની જરૂર છે. કૃપા કરીને મદદ કરો.",
        },
        staffPrompt: "Please sit here. The duty physician has been alerted.",
      },
      {
        id: "water_hydration",
        label: "I need clean drinking water / feeling faint",
        islGloss: "ME WATER DRINK NEED",
        gesture: "WATER",
        spokenPhrases: {
          en: "Please provide clean drinking water. I am feeling dehydrated and faint.",
          hi: "कृपया पीने का पानी दें। मुझे चक्कर और कमजोरी महसूस हो रही है।",
          gu: "કૃપા કરીને પીવાનું પાણી આપો. મને ચક્કર અને નબળાઈ લાગે છે.",
        },
        staffPrompt: "Water is being provided right away.",
      },
      {
        id: "pharmacy_token",
        label: "Where is the pharmacy counter for these medicines?",
        islGloss: "MEDICINE PHARMACY COUNTER WHERE",
        gesture: "HELP",
        spokenPhrases: {
          en: "I have this medical prescription. Where is the pharmacy dispensation counter?",
          hi: "मेरे पास यह दवा का पर्चा है। कृपया बताएं दवाई काउंटर कहाँ है?",
          gu: "મારી પાસે દવાનું પ્રિસ્ક્રિપ્શન છે. દવાનું કાઉન્ટર ક્યાં છે?",
        },
        staffPrompt: "Pharmacy counter is located at Room 102 on ground floor.",
      },
    ],
  },
  {
    id: "police",
    title: "Police & Citizen Safety",
    subtitle: "Grievance reporting, lost belongings & emergency protection",
    icon: ShieldAlert,
    accentColor: "text-amber-500",
    bgGlow: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    tokenPrefix: "POL-GRV",
    scenarios: [
      {
        id: "police_protection",
        label: "I am in distress / need police assistance",
        islGloss: "POLICE ASSISTANCE NEED DANGER",
        gesture: "HELP",
        spokenPhrases: {
          en: "I am deaf and I need urgent police protection and assistance. Please register my statement.",
          hi: "मैं बधिर हूँ और मुझे पुलिस सुरक्षा और सहायता की आवश्यकता है। कृपया मेरा बयान दर्ज करें।",
          gu: "હું બધિર છું અને મને તાત્કાલિક પોલીસ સુરક્ષાની જરૂર છે. કૃપા કરીને મારું નિવેદન લો.",
        },
        staffPrompt: "You are safe here. Officer is taking your written statement.",
      },
      {
        id: "lost_property",
        label: "I lost my bag / documents / phone",
        islGloss: "MY BAG PHONE DOCUMENT LOST",
        gesture: "HELP",
        spokenPhrases: {
          en: "I have lost my bag and personal identification documents. Please help me file a lost property report.",
          hi: "मेरा बैग और पहचान पत्र खो गए हैं। कृपया गुमशुદગી रिपोर्ट दर्ज करने में सहायता करें।",
          gu: "મારું બેગ અને દસ્તાવેજો ખોવાઈ ગયા છે. કૃપા કરીને રિપોર્ટ નોંધવામાં મદદ કરો.",
        },
        staffPrompt: "Please fill out the lost item verification slip below.",
      },
    ],
  },
  {
    id: "bank",
    title: "Bank & Financial Desk",
    subtitle: "Cash transaction, KYC verification, ATM & account help",
    icon: Landmark,
    accentColor: "text-emerald-500",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    tokenPrefix: "BNK-SRV",
    scenarios: [
      {
        id: "bank_teller",
        label: "I want to deposit / withdraw money with passbook",
        islGloss: "PASSBOOK MONEY DEPOSIT WITHDRAW HELP",
        gesture: "HELP",
        spokenPhrases: {
          en: "I am deaf. I want to process a transaction with my bank passbook. Please guide me.",
          hi: "मैं बधिर हूँ। मुझे पासबुक के साथ बैंक लेनदेन करना है। कृपया काउंटर बताएं।",
          gu: "હું બધિર છું. મારે પાસબુક દ્વારા વ્યવહાર કરવો છે. કૃપા કરીને મદદ કરો.",
        },
        staffPrompt: "Please hand over your passbook and withdrawal slip to Counter 3.",
      },
      {
        id: "kyc_update",
        label: "I need to complete Aadhaar biometric KYC",
        islGloss: "AADHAAR KYC BIOMETRIC UPDATE",
        gesture: "STUDENT",
        spokenPhrases: {
          en: "I need to update my bank account Aadhaar KYC and mobile linking.",
          hi: "मुझे अपने बैंक खाते में आधार ई-केवाईसी और मोबाइल नंबर अपडेट कराना है।",
          gu: "મારે મારા બેંક ખાતામાં આધાર કેવાયસી અપડેટ કરાવવું છે.",
        },
        staffPrompt: "Please place your thumb on the biometric scanner.",
      },
    ],
  },
  {
    id: "railway",
    title: "Railway & Metro Transit",
    subtitle: "Divyangjan railway concession, platform inquiry & boarding",
    icon: Train,
    accentColor: "text-cyan-500",
    bgGlow: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    tokenPrefix: "RLY-CON",
    scenarios: [
      {
        id: "concession_ticket",
        label: "Divyangjan concession ticket booking",
        islGloss: "DEAF TRAVEL CONCESSION TICKET BOOK",
        gesture: "HELP",
        spokenPhrases: {
          en: "I am a deaf traveler with a valid railway disability certificate. I need a concession ticket.",
          hi: "मैं दिव्यांगजन रियायती रेलवे टिकट लेना चाहता हूँ। मेरे पास वैध प्रमाण पत्र है।",
          gu: "હું દિવ્યાંગજન કન્સેશન રેલવે ટિકિટ લેવા માગું છું. મારી પાસે સર્ટિફિકેટ છે.",
        },
        staffPrompt: "Please show your original Divyangjan photo identity card.",
      },
      {
        id: "platform_inquiry",
        label: "Which platform does my train arrive on?",
        islGloss: "MY TRAIN PLATFORM NUMBER WHERE",
        gesture: "HELP",
        spokenPhrases: {
          en: "Could you please tell me which platform number my train will arrive at?",
          hi: "कृपया बताएं मेरी ट्रेन किस प्लेटफॉर्म नंबर पर आएगी?",
          gu: "કૃપા કરીને જણાવો કે મારી ટ્રેન કયા પ્લેટફોર્મ પર આવશે?",
        },
        staffPrompt: "Your train is scheduled on Platform Number 2.",
      },
    ],
  },
  {
    id: "udid_govt",
    title: "Govt UDID & Social Welfare",
    subtitle: "Divyangjan pension, disability ID & scholarship assistance",
    icon: FileCheck,
    accentColor: "text-purple-500",
    bgGlow: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    tokenPrefix: "GOV-UDID",
    scenarios: [
      {
        id: "udid_application",
        label: "Status / application of Unique Disability ID (UDID) Card",
        islGloss: "GOVT UDID CARD APPLICATION STATUS",
        gesture: "STUDENT",
        spokenPhrases: {
          en: "I am deaf. I want to check the status of my Unique Disability ID (UDID) application.",
          hi: "मैं अपने यूडीआईडी (UDID) कार्ड की स्थिति जांचना और नया कार्ड बनवाना चाहता हूँ।",
          gu: "હું મારા યુડીઆઈડી (UDID) દિવ્યાંગ કાર્ડનું સ્ટેટસ ચેક કરવા માગું છું.",
        },
        staffPrompt: "Please provide your 14-digit application reference number.",
      },
      {
        id: "pension_welfare",
        label: "Divyangjan monthly disability pension inquiry",
        islGloss: "GOVT DISABILITY PENSION SCHEME INQUIRY",
        gesture: "HELP",
        spokenPhrases: {
          en: "I want to apply for the government Divyangjan disability welfare pension.",
          hi: "मैं सरकार की दिव्यांगजन पेंशन योजना के लिए आवेदन करना चाहता हूँ।",
          gu: "હું સરકારી દિવ્યાંગ પેન્શન યોજના માટે અરજી કરવા માગું છું.",
        },
        staffPrompt: "Here is the pension application checklist and self-declaration form.",
      },
    ],
  },
]

interface PublicDeskProps {
  currentLanguage: string
  onLanguageChange?: (code: string) => void
}

export default function PublicDesk({ currentLanguage }: PublicDeskProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("hospital")
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("doctor_urgency")
  const [staffResponse, setStaffResponse] = useState<string>("")
  const [isListening, setIsListening] = useState(false)
  const [recognitionError, setRecognitionError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  const activeCategory =
    PUBLIC_SERVICES.find((c) => c.id === selectedCategory) || PUBLIC_SERVICES[0]
  const activeScenario =
    activeCategory.scenarios.find((s) => s.id === selectedScenarioId) ||
    activeCategory.scenarios[0]

  const activeLangObj =
    INDIC_LANGUAGES.find((l) => l.code === currentLanguage) || INDIC_LANGUAGES[0]

const SCENARIO_MULTILINGUAL_MAP: Record<string, Record<string, string>> = {
  doctor_urgency: {
    en: "I am deaf. I need urgent medical attention. Please assist me with a doctor.",
    hi: "मैं बधिर हूँ। मुझे तत्काल डॉक्टर की सहायता की आवश्यकता है। कृपया मेरी मदद करें।",
    gu: "હું ડેફ (સાંભળી ન શકનાર) છું. મને તાત્કાલિક ડૉક્ટરની જરૂર છે. કૃપા કરીને મદદ કરો.",
    mr: "मी कर्णबधीर आहे. मला तातडीने डॉक्टरांची गरज आहे. कृपया मला मदत करा.",
    bn: "আমি বধির। আমার অবিলম্বে ডাক্তারের সাহায্য প্রয়োজন। দয়া করে আমাকে সাহায্য করুন।",
    ta: "நான் காது கேளாதவர். எனக்கு அவசர மருத்துவ சிகிச்சை தேவை. தயவுசெய்து மருத்துவரிடம் உதவுங்கள்.",
    te: "నేను వినికిడి లోపం ఉన్నవాడిని. నాకు అత్యవసరంగా డాక్టర్ సహాయం కావాలి. దయచేసి సహాయం చేయండి.",
    kn: "ನಾನು ಕಿವುಡ. ನನಗೆ ತುರ್ತು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಹಾಯ ಮಾಡಿ.",
    ml: "ഞാൻ ബധിരനാണ്. എനിക്ക് അടിയന്തരമായി ഡോക്ടറുടെ സഹായം വേണം. ദയവായി സഹായിക്കൂ.",
    pa: "ਮੈਂ ਬੋਲਾ ਹਾਂ। ਮੈਨੂੰ ਤੁਰੰਤ ਡਾਕਟਰ ਦੀ ਲੋੜ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ।",
    or: "ମୁଁ ବଧିର। ମୋତେ ତୁରନ୍ତ ଡାକ୍ତରଙ୍କ ସାହାଯ୍ୟ ଦରକାର। ଦୟାକରି ସାହାଯ୍ୟ କରନ୍ତୁ।",
    as: "মই কলা। মোক জৰুৰীভাৱে ডাক্তৰৰ প্ৰয়োজন। অনুগ্ৰহ কৰি মোক সহায় কৰক।",
    ur: "میں بہرہ ہوں۔ مجھے فوری طبی امداد کی ضرورت ہے۔ براہ کرم ڈاکٹر سے مدد دلوائیں۔",
  },
  water_hydration: {
    en: "Please provide clean drinking water. I am feeling dehydrated and faint.",
    hi: "कृपया पीने का पानी दें। मुझे चक्कर और कमजोरी महसूस हो रही है।",
    gu: "કૃપા કરીને પીવાનું પાણી આપો. મને ચક્કર અને નબળાઈ લાગે છે.",
    mr: "कृपया पिण्याचे पाणी द्या. मला चक्कर येत आहे.",
    bn: "দয়া করে খাবার জল দিন। আমার মাথা ঘুরছে ও দুর্বল লাগছে।",
    ta: "தயவுசெய்து குடிநீர் வழங்குங்கள். எனக்கு தலைசுற்றலாக உள்ளது.",
    te: "దయచేసి తాగునీరు ఇవ్వండి. నాకు తలతిరుగుతోంది.",
    kn: "ದಯವಿಟ್ಟು ಕುಡಿಯುವ ನೀರು ಕೊಡಿ. ನನಗೆ ತಲೆತಿರುಗುತ್ತಿದೆ.",
    ml: "ദയവായി കുടിവെള്ളം തരിക. എനിക്ക് തലകറക്കം തോന്നുന്നു.",
    pa: "ਕਿਰਪਾ ਕਰਕੇ ਪੀਣ ਦਾ ਸਾਫ਼ ਪਾਣੀ ਦਿਓ। ਮੈਨੂੰ ਚੱਕਰ ਆ ਰਹੇ ਹਨ।",
    or: "ଦୟାକରି ପିଇବା ପାଣି ଦିଅନ୍ତୁ। ମୋତେ ଚକ୍କର ଲାଗୁଛି।",
    as: "অনুগ্ৰহ কৰি মোক খোৱা পানী দিয়ক। মোৰ মূৰ ঘূৰাইছে।",
    ur: "براہ کرم پینے کا صاف پانی فراہم کریں۔ مجھے چکر آ رہے ہیں۔",
  },
  pharmacy_token: {
    en: "I have this medical prescription. Where is the pharmacy dispensation counter?",
    hi: "मेरे पास यह दवा का पर्चा है। कृपया बताएं दवाई काउंटर कहाँ है?",
    gu: "મારી પાસે દવાનું પ્રિસ્ક્રિપ્શન છે. દવાનું કાઉન્ટર ક્યાં છે?",
    mr: "माझ्याकडे औषधांची चिठ्ठी आहे. फार्मसी काउंटर कुठे आहे?",
    bn: "আমার কাছে এই প্রেসক্রিপশন আছে। ওষুধের কাউন্টার কোথায়?",
    ta: "என்னிடம் மருத்துவ சீட்டு உள்ளது. மருந்தகம் எங்கு உள்ளது?",
    te: "నా దగ్గర ఈ మెడికల్ ప్రిస్క్రిప్షన్ ఉంది. మందుల కౌంటర్ ఎక్కడ ఉంది?",
    kn: "ನನ್ನ ಬಳಿ ಔಷಧಿ ಚೀಟಿ ಇದೆ. ಔಷಧಿಯ ಕೌಂಟರ್ ಎಲ್ಲಿದೆ?",
    ml: "എന്റെ പക്കൽ കുറിപ്പടിയുണ്ട്. മരുന്ന് കൗണ്ടർ എവിടെയാണ്?",
    pa: "ਮੇਰੇ ਕੋਲ ਦਵਾਈ ਦੀ ਪਰਚੀ ਹੈ। ਦਵਾਈਆਂ ਦਾ ਕਾਊਂਟਰ ਕਿੱਥੇ ਹੈ?",
    or: "ମୋ ପାଖରେ ଔଷଧ ପତ୍ର ଅଛି। ଔଷଧ କାଉଣ୍ଟର କେଉଁଠି ଅଛି?",
    as: "মোৰ ওচৰত ঔষধৰ প্ৰেচক্ৰিপচন আছে। ফাৰ্মাচী কাউণ্টাৰ ক’ত?",
    ur: "میرے پاس نسخہ ہے۔ ادویات کا کاؤنٹر کہاں ہے؟",
  },
  police_protection: {
    en: "I am deaf and I need urgent police protection and assistance. Please register my statement.",
    hi: "मैं बधिर हूँ और मुझे पुलिस सुरक्षा और सहायता की आवश्यकता है। कृपया मेरा बयान दर्ज करें।",
    gu: "હું બધિર છું અને મને તાત્કાલિક પોલીસ સુરક્ષાની જરૂર છે. કૃપા કરીને મારું નિવેદન લો.",
    mr: "मी कर्णबधीर असून मला पोलिस संरक्षणाची गरज आहे. कृपया माझी तक्रार नोंदवा.",
    bn: "আমি বধির এবং আমার জরুরি পুলিশ সুরক্ষার প্রয়োজন। দয়া করে আমার জবানবন্দি নিন।",
    ta: "நான் காது கேளாதவர், எனக்கு அவசர போலீஸ் பாதுகாப்பு தேவை. தயவுசெய்து எனது புகாரைப் பதிவு செய்யுங்கள்.",
    te: "నేను వినికిడి లోపం ఉన్నవాడిని, నాకు పోలీసు రక్షణ కావాలి. దయచేసి నా ఫిర్యాదు తీసుకోండి.",
    kn: "ನಾನು ಕಿವುಡ, ನನಗೆ ತುರ್ತು ಪೊಲೀಸ್ ರಕ್ಷಣೆ ಬೇಕು. ದಯವಿಟ್ಟು ನನ್ನ ದೂರು ದಾಖಲಿಸಿಕೊಳ್ಳಿ.",
    ml: "ഞാൻ ബധിരനാണ്, എനിക്ക് അടിയന്തര പോലീസ് സംരക്ഷണം വേണം. ദയവായി പരാതി രേഖപ്പെടുത്തൂ.",
    pa: "ਮੈਂ ਬੋਲਾ ਹਾਂ ਅਤੇ ਮੈਨੂੰ ਪੁਲਿਸ ਸੁਰੱਖਿਆ ਦੀ ਲੋੜ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਮੇਰਾ ਬਿਆਨ ਲਿਖੋ।",
    or: "ମୁଁ ବଧିର ଏବଂ ମୋତେ ପୋଲିସ ସୁରକ୍ଷା ଦରକାର। ଦୟାକରି ମୋର ବୟାନ ଲେଖନ୍ତୁ।",
    as: "মই কলা আৰু মোক জৰুৰী আৰক্ষীৰ সহায় লাগে। অনুগ্ৰহ কৰি মোৰ এজাহাৰ লওক।",
    ur: "میں بہرہ ہوں اور مجھے فوری پولیس تحفظ کی ضرورت ہے۔ براہ کرم میرا بیان درج کریں۔",
  },
  lost_property: {
    en: "I have lost my bag and personal identification documents. Please help me file a lost property report.",
    hi: "मेरा बैग और पहचान पत्र खो गए हैं। कृपया गुमशुदगी रिपोर्ट दर्ज करने में सहायता करें।",
    gu: "મારું બેગ અને દસ્તાવેજો ખોવાઈ ગયા છે. કૃપા કરીને રિપોર્ટ નોંધવામાં મદદ કરો.",
    mr: "माझी बॅग आणि कागदपत्रे हरवली आहेत. कृपया तक्रार नोंदवण्यास मदत करा.",
    bn: "আমার ব্যাগ ও কাগজপত্র হারিয়ে গেছে। দয়া করে রিপোর্ট করতে সাহায্য করুন।",
    ta: "எனது பை மற்றும் ஆவணங்கள் தொலைந்துவிட்டன. தயவுசெய்து புகார் பதிவு செய்ய உதவுங்கள்.",
    te: "నా బ్యాగ్ మరియు గుర్తింపు పత్రాలు పోయాయి. దయచేసి ఫిర్యాదు నమోదు చేయండి.",
    kn: "ನನ್ನ ಬ್ಯಾಗ್ ಮತ್ತು ದಾಖಲೆಗಳು ಕಳೆದುಹೋಗಿವೆ. ದಯವಿಟ್ಟು ವರದಿ ದಾಖಲಿಸಲು ಸಹಾಯ ಮಾಡಿ.",
    ml: "എന്റെ ബാഗും രേഖകളും നഷ്ടപ്പെട്ടു. പരാതി നൽകാൻ ദയവായി സഹായിക്കൂ.",
    pa: "ਮੇਰਾ ਬੈਗ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਗੁਆਚ ਗਏ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਰਿਪੋਰਟ ਲਿਖਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।",
    or: "ମୋର ବ୍ୟାଗ୍ ଏବଂ କାଗଜପତ୍ର ହଜିଯାଇଛି। ଦୟାକରି ରିପୋର୍ଟ ଲେଖିବାରେ ସାହାଯ୍ୟ କରନ୍ତୁ।",
    as: "মোৰ বেগ আৰু নথি-পত্ৰ হেৰাল। অনুগ্ৰহ কৰি ৰিপোৰ্ট কৰাত সহায় কৰক।",
    ur: "میرا بیگ اور شناختی دستاویزات گم ہو گئے ہیں۔ براہ کرم رپورٹ درج کروائیں۔",
  },
  bank_teller: {
    en: "I am deaf. I want to process a transaction with my bank passbook. Please guide me.",
    hi: "मैं बधिर हूँ। मुझे पासबुक के साथ बैंक लेनदेन करना है। कृपया काउंटर बताएं।",
    gu: "હું બધિર છું. મારે પાસબુક દ્વારા વ્યવહાર કરવો છે. કૃપા કરીને મદદ કરો.",
    mr: "मी कर्णबधीर आहे. मला पासबुकद्वारे व्यवहार करायचा आहे. कृपया मार्गदर्शन करा.",
    bn: "আমি বধির। পাসবই দিয়ে লেনদেন করতে চাই। দয়া করে সাহায্য করুন।",
    ta: "நான் காது கேளாதவர். பாஸ்புக் மூலம் பரிவர்த்தனை செய்ய வேண்டும். வழிகாட்டவும்.",
    te: "నేను పాస్‌బుక్ ద్వారా లావాదేవీ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశం చేయండి.",
    kn: "ನಾನು ಪಾಸ್‌ಬುಕ್ ಮೂಲಕ ಹಣ ವರ್ಗಾವಣೆ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.",
    ml: "പാസ്ബുക്ക് ഉപയോഗിച്ച് ഇടപാട് നടത്താൻ ആഗ്രഹിക്കുന്നു. ദയവായി സഹായിക്കൂ.",
    pa: "ਮੈਂ ਪਾਸਬੁੱਕ ਨਾਲ ਲੈਣ-ਦੇਣ ਕਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿੱਥੇ ਜਾਵਾਂ।",
    or: "ମୁଁ ପାସବୁକ୍ ସହିତ କାରବାର କରିବାକୁ ଚାହୁଁଛି। ଦୟାକରି ମାର୍ଗଦର୍ଶନ କରନ୍ତୁ।",
    as: "মই পাছবুকৰ জৰিয়তে টকা লেনদেন কৰিব বিচাৰোঁ। অনুগ্ৰহ কৰি সহায় কৰক।",
    ur: "میں پاس بک سے لین دین کرنا چاہتا ہوں۔ براہ کرم رہنمائی فرمائیں۔",
  },
  kyc_update: {
    en: "I need to update my bank account Aadhaar KYC and mobile linking.",
    hi: "मुझे अपने बैंक खाते में आधार ई-केवाईसी और मोबाइल नंबर अपडेट कराना है।",
    gu: "મારે મારા બેંક ખાતામાં આધાર કેવાયસી અપડેટ કરાવવું છે.",
    mr: "मला माझ्या खात्यात आधार केवायसी आणि मोबाईल लिंक करायचा आहे.",
    bn: "আমার ব্যাঙ্ক অ্যাকাউন্টে আধার কেওয়াইসি আপডেট করতে হবে।",
    ta: "எனது வங்கிக் கணக்கில் ஆதார் கேஒய்சி அப்டேட் செய்ய வேண்டும்.",
    te: "నా బ్యాంకు ఖాతాలో ఆధార్ కేవైసీ అప్‌డేట్ చేయాలి.",
    kn: "ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಕೆವೈಸಿ ಅಪ್‌ಡೇಟ್ ಮಾಡಬೇಕಾಗಿದೆ.",
    ml: "എന്റെ ബാങ്ക് അക്കൗണ്ടിൽ ആധാർ കെ.വൈ.സി അപ്‌ഡേറ്റ് ചെയ്യണം.",
    pa: "ਮੈਂ ਆਪਣੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਆਧਾਰ ਕੇਵਾਈਸੀ ਅਪਡੇਟ ਕਰਵਾਉਣਾ ਹੈ।",
    or: "ମୋର ବ୍ୟାଙ୍କ ଖାତାରେ ଆଧାର କେୱାଇସି ଅପଡେଟ୍ କରିବା ଆବଶ୍ୟକ।",
    as: "মোৰ বেংক একাউণ্টত আধাৰ কেৱাইচি আপডেট কৰিব লাগে।",
    ur: "मुझे अपने बैंक अकाउंट में आधार केवाईसी अपडेट करवानी है।",
  },
  concession_ticket: {
    en: "I am a deaf traveler with a valid railway disability certificate. I need a concession ticket.",
    hi: "मैं दिव्यांगजन रियायती रेलवे टिकट लेना चाहता हूँ। मेरे पास वैध प्रमाण पत्र है।",
    gu: "હું દિવ્યાંગજન કન્સેશન રેલવે ટિકિટ લેવા માગું છું. મારી પાસે સર્ટિફિકેટ છે.",
    mr: "मी दिव्यांग रेल्वे सवलत तिकीट घेऊ इच्छितो. माझ्याकडे वैध प्रमाणपत्र आहे.",
    bn: "আমি প্রতিবন্ধী রেলওয়ে ছাড়ের টিকিট কাটতে চাই। আমার কাছে শংসাপত্র আছে।",
    ta: "மாற்றுத்திறனாளி சலுகை ரயில் டிக்கெட் பெற வேண்டும். என்னிடம் சான்றிதழ் உள்ளது.",
    te: "దివ్యాంగుల రాయితీ రైల్వే టిక్కెట్ కావాలి. నా దగ్గర చెల్లుబాటు అయ్యే సర్టిఫికేట్ ఉంది.",
    kn: "ನಾನು ರಿಯಾಯಿತಿ ರೈಲ್ವೆ ಟಿಕೆಟ್ ಪಡೆಯಲು ಬಯಸುತ್ತೇನೆ. ನನ್ನ ಬಳಿ ಪ್ರಮಾಣಪತ್ರವಿದೆ.",
    ml: "റെയിൽവേ ഇളവ് ടിക്കറ്റ് എടുക്കാൻ ആഗ്രഹിക്കുന്നു. സർട്ടിഫിക്കറ്റ് കൈവശമുണ്ട്.",
    pa: "ਮੈਂ ਦਿਵਿਆਂਗਜਨ ਰਿਆਇਤੀ ਰੇਲਵੇ ਟਿਕਟ ਲੈਣੀ ਚਾਹੁੰਦਾ ਹਾਂ। ਮੇਰੇ ਕੋਲ ਸਰਟੀਫਿਕੇਟ ਹੈ।",
    or: "ମୁଁ ଦିବ୍ୟାଙ୍ଗ ରିହାତି ରେଳବାଇ ଟିକେଟ ନେବାକୁ ଚାହୁଁଛି। ମୋ ପାଖରେ ପ୍ରମାଣପତ୍ର ଅଛି।",
    as: "মই ৰে’লৰ ৰেহাইযুক্ত টিকট ল’ব বিচাৰোঁ। মোৰ ওচৰত প্ৰমাণপত্ৰ আছে।",
    ur: "میں معذور رعایت والا ریلوے ٹکٹ حاصل کرنا چاہتا ہوں۔ میرے پاس سرٹیفکیٹ ہے۔",
  },
  platform_inquiry: {
    en: "Could you please tell me which platform number my train will arrive at?",
    hi: "कृपया बताएं मेरी ट्रेन किस प्लेटफॉर्म नंबर पर आएगी?",
    gu: "કૃપા કરીને જણાવો કે મારી ટ્રેન કયા પ્લેટફોર્મ પર આવશે?",
    mr: "कृपया माझी गाडी कोणत्या प्लॅटफॉर्मवर येईल ते सांगा.",
    bn: "আমার ট্রেন কোন প্ল্যাটফর্মে আসবে দয়া করে বলুন।",
    ta: "எனது ரயில் எந்த நடைமேடைக்கு வரும் என்று தயவுசெய்து கூறவும்.",
    te: "నా రైలు ఏ ప్లాట్‌ఫారమ్‌పై వస్తుందో దయచేసి చెప్పండి.",
    kn: "ನನ್ನ ರೈಲು ಯಾವ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಬರುತ್ತದೆ ಎಂದು ದಯವಿಟ್ಟು ತಿಳಿಸಿ.",
    ml: "എന്റെ ട്രെയിൻ ഏത് പ്ലാറ്റ്‌ഫോമിലാണ് വരുന്നത് എന്ന് ദയവായി പറയൂ.",
    pa: "ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਮੇਰੀ ਰੇਲਗੱਡੀ ਕਿਹੜੇ ਪਲੇਟਫਾਰਮ 'ਤੇ ਆਵੇਗੀ?",
    or: "ଦୟାକରି କୁହନ୍ତୁ ମୋ ଟ୍ରେନ୍ କେଉଁ ପ୍ଲାଟଫର୍ମକୁ ଆସିବ?",
    as: "মোৰ ৰে’লখন কোনটো প্লেটফৰ্মত আহিব অনুগ্ৰহ কৰি কওক।",
    ur: "براہ کرم بتائیں میری ٹرین کس پلیٹ فارم پر آئے گی؟",
  },
  udid_application: {
    en: "I am deaf. I want to check the status of my Unique Disability ID (UDID) application.",
    hi: "मैं अपने यूडीआईडी (UDID) कार्ड की स्थिति जांचना और नया कार्ड बनवाना चाहता हूँ।",
    gu: "હું મારા યુડીઆઈડી (UDID) દિવ્યાંગ કાર્ડનું સ્ટેટસ ચેક કરવા માગું છું.",
    mr: "मी माझ्या यूडीआयडी (UDID) अर्जाची स्थिती तपासू इच्छितो.",
    bn: "আমি আমার ইউডিআইডি (UDID) কার্ডের স্থিতি পরীক্ষা করতে চাই।",
    ta: "எனது யுடிஐடி (UDID) அட்டை விண்ணப்ப நிலையை அறிய விரும்புகிறேன்.",
    te: "నా యూడీఐడీ (UDID) దరఖాస్తు స్థితిని తనిಖీ చేయాలనుకుంటున్నాను.",
    kn: "ನನ್ನ ಯುಡಿಐಡಿ (UDID) ಕಾರ್ಡ್ ಅರ್ಜಿಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುತ್ತೇನೆ.",
    ml: "എന്റെ യു.ഡി.ഐ.ഡി (UDID) അപേക്ഷയുടെ അവസ്ഥ അറിയാൻ ആഗ്രഹിക്കുന്നു.",
    pa: "ਮੈਂ ਆਪਣੇ ਯੂਡੀਆਈਡੀ (UDID) ਕਾਰਡ ਦੀ ਸਥਿਤੀ ਚੈੱਕ ਕਰਨੀ ਚਾਹੁੰਦਾ ਹਾਂ।",
    or: "ମୁଁ ମୋର ୟୁଡିଆଇଡି (UDID) ଆବେଦନ ସ୍ଥିତି ଯାଞ୍ଚ କରିବାକୁ ଚାହୁଁଛି।",
    as: "মই মোৰ ইউডিআইডি (UDID) কাৰ্ডৰ স্থিতি পৰীক্ষা কৰিব বিচাৰোঁ।",
    ur: "میں اپنے یو ڈی آئی ڈی (UDID) کارڈ کی صورتحال معلوم کرنا چاہتا ہوں۔",
  },
  pension_welfare: {
    en: "I want to apply for the government Divyangjan disability welfare pension.",
    hi: "मैं सरकार की दिव्यांगजन पेंशन योजना के लिए आवेदन करना चाहता हूँ।",
    gu: "હું સરકારી દિવ્યાંગ પેન્શન યોજના માટે અરજી કરવા માગું છું.",
    mr: "मला शासकीय दिव्यांग पेन्शन योजनेसाठी अर्ज करायचा आहे.",
    bn: "আমি সরকারি প্রতিবন্ধী পেনশন প্রকল্পের জন্য আবেদন করতে চাই।",
    ta: "அரசு மாற்றுத்திறனாளி ஓய்வூதியத் திட்டத்திற்கு விண்ணப்பிக்க விரும்புகிறேன்.",
    te: "ప్రభుత్వ దివ్యాంగుల పెన్షన్ పథకానికి దరఖాస్తు చేసుకోవాలనుకుంటున్నాను.",
    kn: "ನಾನು ಸರ್ಕಾರದ ವಿಕಲಚೇತನರ ಪಿಂಚಣಿ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೇನೆ.",
    ml: "സർക്കാർ ഭിന്നശേഷി പെൻഷൻ പദ്ധതിക്ക് അപേക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നു.",
    pa: "ਮੈਂ ਸਰਕਾਰੀ ਦਿਵਿਆਂਗਜਨ ਪੈਨਸ਼ਨ ਸਕੀਮ ਲਈ ਅਰਜ਼ੀ ਦੇਣਾ ਚਾਹੁੰਦਾ ਹਾਂ।",
    or: "ମୁଁ ସରକାରୀ ଦିବ୍ୟାଙ୍ଗ ପେନସନ ଯୋଜନା ପାଇଁ ଆବେଦନ କରିବାକୁ ଚାହୁଁଛି।",
    as: "মই চৰকাৰী দিব্যাংগ পেন্সন আঁচনিৰ বাবে আবেদন কৰিব বিচাৰোঁ।",
    ur: "میں سرکاری معذوری پنشن سکیم کے لیے درخواست دینا چاہتا ہوں۔",
  },
}

  const localizedMap = SCENARIO_MULTILINGUAL_MAP[activeScenario.id]
  const spokenPhrase =
    localizedMap?.[currentLanguage] ||
    activeScenario.spokenPhrases[currentLanguage] ||
    activeScenario.spokenPhrases["en"] ||
    activeScenario.label

  const tokenNumber = `${activeCategory.tokenPrefix}-${new Date().getDate()}${new Date().getMonth() + 1}-084`

  const handleSpeakScenario = () => {
    speakText(spokenPhrase, currentLanguage)
  }

  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    setRecognitionError(null)
    const recognizer = createSpeechRecognizer(
      currentLanguage,
      (text) => {
        setStaffResponse(text)
        setIsListening(false)
      },
      (err) => {
        setRecognitionError(String(err))
        setIsListening(false)
      }
    )

    if (recognizer) {
      try {
        recognizer.start()
        setIsListening(true)
      } catch {
        setRecognitionError("Unable to open microphone. Check browser permissions.")
        setIsListening(false)
      }
    } else {
      setRecognitionError("Speech recognition not supported in this browser.")
    }
  }

  const handlePrintSlip = () => {
    window.print()
  }

  const handleCopySlip = () => {
    const text = `[BHARATSIGN BRIDGE - JAN SUVIDHA DESK]
Token: ${tokenNumber}
Department: ${activeCategory.title}
Request: ${activeScenario.label}
Spoken Translation: "${spokenPhrase}"
Time: ${new Date().toLocaleTimeString()}
Date: ${new Date().toLocaleDateString()}`
    navigator.clipboard.writeText(text)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <Breadcrumbs items={[{ label: "Universal Public Services Desk (Jan-Suvidha)" }]} />

        {/* Clean Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>Accessible Citizen Facilitation Counter</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Jan-Suvidha Universal Public Desk
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Break down barriers at hospitals, police stations, banks, railway counters, and government offices with instant bilingual voice broadcasts and 3D Indian Sign Language interpretation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSlip}
              className="gap-2 text-xs font-bold border-border shadow-sm rounded-xl h-10"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Slip</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSpeakScenario}
              className="gap-2 text-xs font-bold bg-primary text-white shadow-md rounded-xl h-10"
            >
              <Volume2 className="h-4 w-4" />
              <span>Broadcast Aloud ({activeLangObj.name})</span>
            </Button>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PUBLIC_SERVICES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedScenarioId(cat.scenarios[0].id)
                }}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left gap-2 p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? `${cat.bgGlow} ${cat.borderColor} border-2 shadow-lg scale-[1.02]`
                    : "bg-card/70 border-border hover:bg-card hover:border-border/80"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${cat.bgGlow} ${cat.accentColor} border ${cat.borderColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-foreground leading-tight">
                    {cat.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 hidden sm:block mt-0.5">
                    {cat.scenarios.length} Quick Flows
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Split-Screen Interaction Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Request Cards for Deaf Citizen */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <h2 className="font-bold text-sm text-foreground">
                    1. Select Deaf Citizen Request
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                  {activeCategory.tokenPrefix}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 mt-4">
                {activeCategory.scenarios.map((sc) => {
                  const isScenarioSelected = selectedScenarioId === sc.id
                  return (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border text-left transition-all ${
                        isScenarioSelected
                          ? "bg-primary/10 border-primary text-foreground shadow-sm"
                          : "bg-background/80 border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-snug">
                          {sc.label}
                        </span>
                        {isScenarioSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80">
                        <span>ISL GLOSS: {sc.islGloss}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action: Play Sound for Counter Staff */}
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-3">
                <Button
                  onClick={handleSpeakScenario}
                  className="w-full gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl h-11"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Play Speech for Officer / Doctor</span>
                </Button>
              </div>
            </div>

            {/* Officer / Doctor Speech-to-Sign Response Station */}
            <div className="rounded-3xl bg-card border border-border p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-sm text-foreground">
                    2. Officer / Doctor Voice Response
                  </h2>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Mic → Translates to Deaf User
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                The counter staff can speak directly. Their response will be displayed in large bold text and translated to sign language.
              </p>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleMic}
                  variant={isListening ? "destructive" : "outline"}
                  className="gap-2 text-xs font-bold rounded-xl h-10 px-4"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-primary" />
                      <span>Staff Speak Now</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStaffResponse(activeScenario.staffPrompt)}
                  className="text-xs text-muted-foreground hover:text-foreground h-10"
                >
                  Use Suggested Reply
                </Button>
              </div>

              {recognitionError && (
                <div className="text-[11px] text-rose-500 bg-rose-500/10 p-2 rounded-xl">
                  {recognitionError}
                </div>
              )}

              {/* Live Display of Staff Response */}
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs min-h-[50px] flex items-center">
                {staffResponse ? (
                  <p className="font-semibold text-foreground leading-relaxed">
                    🗣️ Staff Said: <span className="text-primary font-bold">"{staffResponse}"</span>
                  </p>
                ) : (
                  <span className="text-muted-foreground italic text-[11px]">
                    Waiting for staff voice or click 'Use Suggested Reply'...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Sign Interpreter & Official Printable Slip */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 3D Sign Avatar Presenter */}
            <div className="rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="font-bold text-sm text-foreground">
                    ISLRTC 3D Visual Sign Interpretation
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  {activeScenario.gesture}
                </span>
              </div>

              {/* Avatar Viewport */}
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 relative mt-4 border border-border/80">
                <ThreeAvatar
                  activeGesture={activeScenario.gesture}
                  signingSpeed={1.0}
                  showControls={true}
                  initialCameraView="upper-body"
                />
              </div>

              {/* ISL Grammar Gloss Subtitle Bar */}
              <div className="mt-3 p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-mono">
                    ISL Linguistic Gloss:
                  </span>
                  <span className="font-black text-primary text-sm tracking-wider">
                    {activeScenario.islGloss}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSpeakScenario}
                  className="gap-1.5 text-xs text-primary font-bold h-8"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Speak</span>
                </Button>
              </div>
            </div>

            {/* Official Printable Facilitation Slip */}
            <div className="rounded-3xl bg-card border border-border p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-sm text-foreground">
                    Official Facilitation Slip (Hand to Counter)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopySlip}
                    className="h-8 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrintSlip}
                    className="h-8 text-xs font-bold gap-1 rounded-xl"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Slip</span>
                  </Button>
                </div>
              </div>

              {/* Printable Card Area */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between text-muted-foreground text-[11px] pb-2 border-b border-border/60">
                  <span className="font-bold text-foreground">
                    BHARATSIGN BRIDGE • JAN SUVIDHA DESK
                  </span>
                  <span className="text-primary font-bold">{tokenNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">FACILITY</span>
                    <span className="font-bold text-foreground">{activeCategory.title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">COMMUNICATION</span>
                    <span className="font-bold text-emerald-400">ISL + {activeLangObj.name} Voice</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground block text-[10px]">REQUEST STATEMENT</span>
                  <p className="font-bold text-foreground text-xs font-sans mt-0.5">
                    "{spokenPhrase}"
                  </p>
                </div>

                <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Rights of Persons with Disabilities Act (RPwD 2016) Protected</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
