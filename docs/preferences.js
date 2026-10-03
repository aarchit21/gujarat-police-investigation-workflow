(function () {
  const languageKey = 'vivechna-language';
  const themeKey = 'vivechna-theme';
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const gu = {
    'Investigation companion': 'તપાસ સહાયક', 'CASE NAVIGATION': 'કેસ નેવિગેશન', 'All cases': 'બધા કેસ', 'FIR overview': 'એફઆઈઆર સારાંશ', 'Investigation steps': 'તપાસના પગલાં', 'Source guidance': 'મૂળ માર્ગદર્શન', 'Cases': 'કેસ', 'Upload FIR': 'એફઆઈઆર અપલોડ કરો', 'Open case': 'કેસ ખોલો', 'Language': 'ભાષા', 'Appearance': 'દેખાવ', 'Light mode': 'લાઇટ મોડ', 'Dark mode': 'ડાર્ક મોડ', 'Local planning view': 'સ્થાનિક આયોજન દૃશ્ય', 'Completion changes stay in this browser.': 'પૂર્ણ થયેલા પગલાંનો રેકોર્ડ આ બ્રાઉઝરમાં જ રહે છે.',
    'SANAND POLICE STATION · AHMEDABAD': 'સાણંદ પોલીસ સ્ટેશન · અમદાવાદ', 'Investigation workflow': 'તપાસનો કાર્યપ્રવાહ', 'Common procedure and crime-specific actions, ordered together so the next step is clear.': 'સામાન્ય પ્રક્રિયા અને ગુનાને લગતા વિશેષ પગલાં ક્રમમાં દર્શાવ્યાં છે.', 'Open original case record': 'મૂળ કેસ રેકોર્ડ ખોલો', 'FIR OVERVIEW': 'એફઆઈઆર સારાંશ', 'Sanand Police Station · Ahmedabad District': 'સાણંદ પોલીસ સ્ટેશન · અમદાવાદ જિલ્લો', 'CRIME-SPECIFIC ROUTE': 'ગુના-વિશેષ માર્ગ', 'Child sexual offences · POCSO': 'બાળક વિરુદ્ધ જાતીય ગુનાઓ · પોક્સો', 'Also review abduction and digital evidence actions': 'અપહરણ અને ડિજિટલ પુરાવાના પગલાં પણ તપાસો', 'View all FIR fields': 'એફઆઈઆરની બધી વિગતો જુઓ', 'Personal identifiers and the exact incident location are redacted on this public page.': 'આ જાહેર પૃષ્ઠ પર વ્યક્તિગત ઓળખ અને ઘટનાનું ચોક્કસ સ્થળ છુપાવેલ છે.',
    'SOURCE-LINKED PROCEDURE': 'મૂળ સ્ત્રોત સાથે જોડાયેલી પ્રક્રિયા', 'Follow the numbered order. Blue steps are common to investigations; amber steps arise from this FIR.': 'ક્રમ પ્રમાણે આગળ વધો. વાદળી પગલાં સામાન્ય છે; ભૂખરા-પીળા પગલાં આ એફઆઈઆર માટે છે.', 'key milestones': 'મુખ્ય પગલાં', 'detailed guidance entries': 'વિગતવાર માર્ગદર્શન નોંધો', 'Open a milestone for guidance in its investigation area.': 'પગલું ખોલીને સંબંધિત માર્ગદર્શન જુઓ.', 'Browse all guidance': 'બધું માર્ગદર્શન જુઓ', 'Common procedures': 'સામાન્ય પ્રક્રિયાઓ', 'Crime-specific procedures': 'ગુના-વિશેષ પ્રક્રિયાઓ', 'Shared steps and safeguards ·': 'સામાન્ય પગલાં અને સાવચેતીઓ ·', 'Crime-specific · triggered by this FIR ·': 'ગુના-વિશેષ · આ એફઆઈઆર મુજબ ·', 'ORDER': 'ક્રમ', 'NEXT IN WORKFLOW': 'આગળનું પગલું', 'Go to this step': 'આ પગલા પર જાઓ', 'completed': 'પૂર્ણ', 'next review': 'આગળ તપાસો', 'pending': 'બાકી', 'optional': 'વૈકલ્પિક', 'Only FIR registration is confirmed by the source record. The source does not record completion of other tasks. Check the case diary before marking a step complete. Changes on this page stay in this browser.': 'મૂળ રેકોર્ડમાં ફક્ત એફઆઈઆર નોંધણીની પુષ્ટિ છે. અન્ય કાર્યો પૂર્ણ થયા હોવાની નોંધ નથી. પગલું પૂર્ણ ચિહ્નિત કરતાં પહેલાં કેસ ડાયરી તપાસો. આ પૃષ્ઠના ફેરફારો આ બ્રાઉઝરમાં જ રહે છે.',
    'COMPLETE SOURCE MATERIAL': 'સંપૂર્ણ મૂળ સામગ્રી', 'Full investigation guidance': 'સંપૂર્ણ તપાસ માર્ગદર્શન', 'Show all guidance': 'બધું માર્ગદર્શન બતાવો', 'All': 'બધું', 'Common': 'સામાન્ય', 'Crime-specific': 'ગુના-વિશેષ', 'Supporting sources': 'સહાયક સ્ત્રોતો', 'All times': 'બધા સમય', 'Right now': 'હમણાં', 'Within 24 hours': '૨૪ કલાકમાં', 'This week': 'આ અઠવાડિયે', 'Before charge sheet': 'આરોપપત્ર પહેલાં', 'All importance': 'બધી અગત્યતા', 'Must do': 'ફરજિયાત', 'Should do': 'કરવું જોઈએ', 'Reference': 'સંદર્ભ', 'All activities': 'બધી પ્રવૃત્તિઓ', 'Show more guidance': 'વધુ માર્ગદર્શન જુઓ', 'Open full original case record': 'સંપૂર્ણ મૂળ કેસ રેકોર્ડ ખોલો', 'Investigation guidance with source references': 'મૂળ સ્ત્રોતોના સંદર્ભ સાથે તપાસ માર્ગદર્શન', 'Guidance includes required, conditional and reference material. Checklist changes stay in this browser.': 'માર્ગદર્શનમાં ફરજિયાત, શરતી અને સંદર્ભ સામગ્રી છે. ચેકલિસ્ટના ફેરફારો આ બ્રાઉઝરમાં રહે છે.',
    'FIR No.': 'એફઆઈઆર નંબર', 'Police Station': 'પોલીસ સ્ટેશન', 'District': 'જિલ્લો', 'Sections applied': 'લાગુ કલમો', 'Date & time of offence': 'ગુનાની તારીખ અને સમય', 'Place of offence': 'ગુનાનું સ્થળ', 'Date & time FIR registered': 'એફઆઈઆર નોંધણીની તારીખ અને સમય', 'Complainant': 'ફરિયાદી', 'Complainant address': 'ફરિયાદીનું સરનામું', 'Complainant mobile': 'ફરિયાદીનો મોબાઇલ', 'Victim': 'પીડિત', 'Accused': 'આરોપી', 'Accused address': 'આરોપીનું સરનામું', 'Accused mobile': 'આરોપીનો મોબાઇલ', 'Electronic evidence 1': 'ઇલેક્ટ્રોનિક પુરાવો ૧', 'Electronic evidence 2': 'ઇલેક્ટ્રોનિક પુરાવો ૨', 'Investigating Officer': 'તપાસ અધિકારી', 'Registering Officer': 'નોંધણી અધિકારી', 'Redacted in public view': 'જાહેર દૃશ્યમાં છુપાવેલ', 'Sanand Police Station': 'સાણંદ પોલીસ સ્ટેશન', 'Ahmedabad': 'અમદાવાદ', 'photos and the call recording of our conversation': 'ફોટા અને અમારી વાતચીતનું કોલ રેકોર્ડિંગ', 'mobile number': 'મોબાઇલ નંબર', 'B.N.S. Section 64(2)(M), B.N.S. Section 87, B.N.S. Section 351(2), Section 4 of POCSO Act 2012, Section 5(L) of POCSO Act 2012, Section 6 of POCSO Act 2012, Section 8 of POCSO Act 2012': 'B.N.S. કલમ 64(2)(M), B.N.S. કલમ 87, B.N.S. કલમ 351(2), POCSO અધિનિયમ 2012 ની કલમ 4, કલમ 5(L), કલમ 6 અને કલમ 8',
    'Completed': 'પૂર્ણ', 'Current': 'હાલનું', 'Pending': 'બાકી', 'Optional': 'વૈકલ્પિક', 'Common procedure': 'સામાન્ય પ્રક્રિયા', 'Crime-specific procedure': 'ગુના-વિશેષ પ્રક્રિયા', 'FOR THIS FIR': 'આ એફઆઈઆર માટે', 'ORIGINAL GUIDANCE': 'મૂળ માર્ગદર્શન', 'WHY THIS STEP': 'આ પગલું શા માટે', 'KEY ACTIONS': 'મુખ્ય કાર્યવાહી', 'SOURCE REFERENCES': 'સ્ત્રોત સંદર્ભો', 'Guidance in this area': 'આ ક્ષેત્રનું માર્ગદર્શન', 'Primary source': 'મુખ્ય સ્ત્રોત', 'Browse related guidance': 'સંબંધિત માર્ગદર્શન જુઓ', 'Confirmed from FIR': 'એફઆઈઆરમાંથી પુષ્ટિ', 'Mark pending': 'બાકી ચિહ્નિત કરો', 'Mark complete': 'પૂર્ણ ચિહ્નિત કરો', 'REVIEW NEXT': 'આગળ તપાસો', 'VERIFY STATUS': 'સ્થિતિ ચકાસો', 'REVIEW': 'તપાસો', 'All required steps marked complete': 'બધા જરૂરી પગલાં પૂર્ણ ચિહ્નિત છે', 'Review the case diary and remaining optional leads.': 'કેસ ડાયરી અને બાકી વૈકલ્પિક માહિતી તપાસો.', 'Review the complete source entry for detail.': 'વિગત માટે સંપૂર્ણ મૂળ નોંધ જુઓ.', 'Consult the complete source guidance for this step.': 'આ પગલા માટે સંપૂર્ણ મૂળ માર્ગદર્શન જુઓ.', 'Switch to light mode': 'લાઇટ મોડ ચાલુ કરો', 'Switch to dark mode': 'ડાર્ક મોડ ચાલુ કરો', 'Procedure categories': 'પ્રક્રિયાના પ્રકાર', 'Step status legend': 'પગલાંની સ્થિતિ', 'Common procedures': 'સામાન્ય પ્રક્રિયાઓ',
    'Common': 'સામાન્ય', 'Supporting source': 'સહાયક સ્ત્રોત', 'Why, legal basis and source details': 'કારણ, કાનૂની આધાર અને સ્ત્રોતની વિગતો', 'Original guidance': 'મૂળ માર્ગદર્શન', 'Why it appears': 'આ શા માટે દેખાય છે', 'Timing': 'સમય', 'Applies when': 'ક્યારે લાગુ પડે', 'Note': 'નોંધ', 'Legal basis': 'કાનૂની આધાર', 'Additional guidance': 'વધુ માર્ગદર્શન', 'Source differences': 'સ્ત્રોતોમાં તફાવત', 'Sources': 'સ્ત્રોતો', 'For this FIR': 'આ એફઆઈઆર માટે', 'Action checklist': 'કાર્ય ચેકલિસ્ટ', 'Clear checks': 'ચિહ્નો દૂર કરો', 'Check all items': 'બધી બાબતો ચિહ્નિત કરો', 'No guidance matches this search.': 'આ શોધ સાથે કોઈ માર્ગદર્શન મળ્યું નથી.', 'Search guidance, sections, sources…': 'માર્ગદર્શન, કલમો અને સ્ત્રોતો શોધો…', 'Search guidance': 'માર્ગદર્શન શોધો', 'Filter guidance time': 'માર્ગદર્શનનો સમય ફિલ્ટર કરો', 'Filter guidance importance': 'માર્ગદર્શનની અગત્યતા ફિલ્ટર કરો', 'Filter guidance group': 'માર્ગદર્શનનો સમૂહ ફિલ્ટર કરો', 'Case navigation': 'કેસ નેવિગેશન', 'Open case navigation': 'કેસ નેવિગેશન ખોલો', 'Close case navigation': 'કેસ નેવિગેશન બંધ કરો', 'Case sections': 'કેસના વિભાગો', 'Guidance classification': 'માર્ગદર્શનનું વર્ગીકરણ', 'Investigation progress': 'તપાસની પ્રગતિ', 'Key FIR fields': 'એફઆઈઆરની મુખ્ય વિગતો', 'Investigation procedure timeline': 'તપાસ પ્રક્રિયાની સમયરેખા', 'Page sections': 'પૃષ્ઠના વિભાગો',
    'CASE WORKSPACE': 'કેસ કાર્યક્ષેત્ર', 'Cases and FIRs': 'કેસ અને એફઆઈઆર', 'Open a generated case to review its FIR record and source-linked investigation steps.': 'એફઆઈઆર રેકોર્ડ અને સ્ત્રોત આધારિત તપાસના પગલાં જોવા કેસ ખોલો.', 'NEW CASE': 'નવો કેસ', 'Upload an FIR': 'એફઆઈઆર અપલોડ કરો', 'Send a PDF, Word, or text FIR to the live processor. It extracts the record and generates investigation guidance.': 'PDF, Word અથવા ટેક્સ્ટ એફઆઈઆર જીવંત પ્રક્રિયા સેવામાં મોકલો. તે વિગતો કાઢીને તપાસ માર્ગદર્શન બનાવે છે.', 'Open FIR uploader': 'એફઆઈઆર અપલોડર ખોલો', 'Opens the existing FIR processing service.': 'હાલની એફઆઈઆર પ્રક્રિયા સેવા ખોલે છે.', 'HOW IT WORKS': 'પ્રક્રિયા કેવી રીતે ચાલે છે', 'Upload the FIR': 'એફઆઈઆર અપલોડ કરો', 'PDF, Word, or text': 'PDF, Word અથવા ટેક્સ્ટ', 'Review the extracted record': 'મેળવેલી વિગતો તપાસો', 'Fields remain traceable to the FIR': 'વિગતો એફઆઈઆર સાથે જોડાયેલી રહે છે', 'Follow the investigation': 'તપાસ આગળ વધારો', 'Common and crime-specific procedures': 'સામાન્ય અને ગુના-વિશેષ પ્રક્રિયાઓ', 'CASE REGISTER': 'કેસ નોંધણી', 'Generated cases': 'બનાવેલા કેસ', 'Case pages contain the FIR context and investigation guidance.': 'કેસ પૃષ્ઠોમાં એફઆઈઆરની વિગતો અને તપાસ માર્ગદર્શન છે.', 'View all cases on live system': 'જીવંત સિસ્ટમમાં બધા કેસ જુઓ', 'Sanand Police Station · Ahmedabad': 'સાણંદ પોલીસ સ્ટેશન · અમદાવાદ', 'POCSO and child sexual offence route': 'પોક્સો અને બાળક વિરુદ્ધ જાતીય ગુનાનો માર્ગ', 'WORKFLOW AVAILABLE': 'કાર્યપ્રવાહ ઉપલબ્ધ', 'Additional processed cases remain available through the live case register.': 'વધુ પ્રક્રિયા કરેલા કેસ જીવંત કેસ નોંધણીમાં ઉપલબ્ધ છે.', 'How cases are processed': 'કેસની પ્રક્રિયા કેવી રીતે થાય છે', 'Main navigation': 'મુખ્ય નેવિગેશન',
    'Register the case': 'કેસ નોંધો', 'Secure and record the scene': 'સ્થળ સુરક્ષિત રાખો અને નોંધો', 'The body: inquest and post-mortem': 'મૃતદેહ: પંચનામું અને પોસ્ટમોર્ટમ', 'Collect and seize evidence': 'પુરાવા એકત્ર કરો અને જપ્ત કરો', 'Digital and CCTV evidence': 'ડિજિટલ અને CCTV પુરાવા', 'Forensic laboratory': 'ફોરેન્સિક પ્રયોગશાળા', 'Search and seizure powers': 'તલાશી અને જપ્તીની સત્તા', 'Arrest, custody and remand': 'ધરપકડ, કસ્ટડી અને રિમાન્ડ', 'Statements and witnesses': 'નિવેદનો અને સાક્ષીઓ', 'Case diary, reports and supervision': 'કેસ ડાયરી, અહેવાલ અને દેખરેખ', 'Charge sheet and court': 'આરોપપત્ર અને અદાલત', 'Victim and family': 'પીડિત અને પરિવાર', 'Other procedure': 'અન્ય પ્રક્રિયા', 'Forensic examination by crime type': 'ગુનાના પ્રકાર મુજબ ફોરેન્સિક તપાસ', 'now': 'હમણાં', '24h': '૨૪ કલાકમાં', 'week': 'આ અઠવાડિયે', 'later': 'પછી', 'Guidance area:': 'માર્ગદર્શન ક્ષેત્ર:', 'FIR ACCOUNT': 'એફઆઈઆર મુજબની ઘટના', 'All FIR fields': 'એફઆઈઆરની બધી વિગતો', 'I have reviewed this guidance entry.': 'મેં આ માર્ગદર્શન નોંધ તપાસી છે.', 'Untitled guidance': 'શીર્ષક વિનાનું માર્ગદર્શન', 'p.': 'પૃ.', 'The FIR alleges that a minor was contacted through Instagram. It describes threats involving photos and call recordings, travel to another location, and an alleged sexual offence.': 'એફઆઈઆર મુજબ એક સગીરનો ઇન્સ્ટાગ્રામ દ્વારા સંપર્ક કરવામાં આવ્યો હતો. તેમાં ફોટા અને કોલ રેકોર્ડિંગ સંબંધિત ધમકીઓ, અન્ય સ્થળે લઈ જવાની ઘટના અને કથિત જાતીય ગુનાનું વર્ણન છે.'
  };
  const guSteps = {
    g1: ['ફરિયાદ મેળવો અને એફઆઈઆર નોંધો', 'એફઆઈઆર રેકોર્ડ અને ફરિયાદીને આપેલી નકલની ખાતરી કરો.', 'મૂળ કેસ રેકોર્ડમાં એફઆઈઆર નંબર અને નોંધણી તારીખ છે.'],
    g2: ['લોકોની સુરક્ષા કરો અને સ્થળે પહોંચો', 'તાત્કાલિક સલામતી તપાસો અને જરૂરી સહાય ગોઠવો.'],
    g3: ['ઘટનાસ્થળ સુરક્ષિત રાખો', 'પ્રવેશ નિયંત્રિત કરો અને સંભવિત પુરાવા બગડતા અટકાવો.'],
    g4: ['પુરાવા એકત્ર કરતાં પહેલાં સ્થળ નોંધો', 'સ્થળની મૂળ સ્થિતિના ફોટા, નકશો અને નોંધ તૈયાર કરો.'],
    g5: ['પુરાવા એકત્ર, સીલ અને નોંધો', 'જપ્તી નોંધ બનાવો અને પુરાવાની કસ્ટડીનો રેકોર્ડ રાખો.'],
    g6: ['સાક્ષીઓનાં નિવેદન નોંધો', 'નિવેદનો વહેલી તકે અને તેમના મૂળ શબ્દોમાં નોંધો.'],
    g7: ['તપાસની દરેક કાર્યવાહી દસ્તાવેજિત કરો', 'કેસ ડાયરી, પુરાવા રેકોર્ડ અને દેખરેખની નોંધ જાળવો.'],
    g8: ['તારણો તપાસો અને અહેવાલ તૈયાર કરો', 'બાકી પુરાવા તપાસીને તપાસનું પરિણામ નોંધો.'],
    c1: ['બાળક માટે સંવેદનશીલ રીતે નિવેદન નોંધો', 'સુરક્ષિત સ્થળે બાળકના પોતાના શબ્દોમાં નિવેદન લો.', 'એફઆઈઆર મુજબ કથિત ગુના સમયે ફરિયાદી ૧૮ વર્ષથી ઓછી ઉંમરના હતા.'],
    c2: ['પીડિતની તબીબી તપાસની સ્થિતિ ચકાસો', 'તબીબી રેકોર્ડ, સંમતિ અને સાચવેલા તારણો તપાસો.', 'દર્શાવેલી જાતીય ગુનાની કલમો માટે તાત્કાલિક તબીબી સહાય જરૂરી છે; મૂળ રેકોર્ડમાં તપાસ થઈ હોવાની પુષ્ટિ નથી.'],
    c3: ['બાળ સુરક્ષા સત્તાધિકારીઓને જાણ કરો', 'બાળ કલ્યાણ અને અદાલતને જરૂરી જાણ પૂર્ણ કરો.', 'એફઆઈઆરમાં પોક્સોની કલમો દર્શાવેલી છે.'],
    c4: ['ડિજિટલ ધમકીઓ અને સંચાર સાચવો', 'સંબંધિત ફોટા, કોલ રેકોર્ડ અને પ્લેટફોર્મ પુરાવા સુરક્ષિત કરો.', 'એફઆઈઆરમાં ફોટા અને કોલ રેકોર્ડિંગ જાહેર કરવાની ધમકી વર્ણવેલી છે.'],
    c5: ['મેજિસ્ટ્રેટ સમક્ષ નિવેદન માટે વિનંતી કરો', 'પીડિતના નિવેદનની અરજી બિનજરૂરી વિલંબ વિના મોકલો.', 'મૂળ માર્ગદર્શન મુજબ દર્શાવેલા જાતીય ગુનાના માર્ગમાં આ જરૂરી છે.'],
    c6: ['માર્ગ પર ઉપલબ્ધ CCTV તપાસો', 'કેમેરા હોય ત્યાં ફૂટેજ મટી જાય તે પહેલાં સાચવો.', 'એફઆઈઆરમાં સ્થળો વચ્ચેની અવરજવર છે; ઉપલબ્ધ ફૂટેજ સમયક્રમ સમજવામાં મદદ કરી શકે છે.']
  };
  function read(key, allowed, fallback) { try { const value = localStorage.getItem(key); return allowed.includes(value) ? value : fallback; } catch (_) { return fallback; } }
  let language = read(languageKey, ['en', 'gu'], 'en');
  let theme = read(themeKey, ['light', 'dark'], 'light');
  function t(value) {
    if (language !== 'gu') return value;
    const exact = gu[value];
    if (exact) return exact;
    let match;
    if ((match = /^(\d+) additional fields$/.exec(value))) return `વધારાની ${match[1]} વિગતો`;
    if ((match = /^(\d+) steps$/.exec(value))) return `${match[1]} પગલાં`;
    if ((match = /^(\d+) of (\d+) milestones marked complete$/.exec(value))) return `${match[2]}માંથી ${match[1]} મુખ્ય પગલાં પૂર્ણ`;
    if ((match = /^1 confirmed by FIR · (\d+) browser-local updates?$/.exec(value))) return `૧ એફઆઈઆરમાંથી પુષ્ટિ · ${match[1]} સ્થાનિક ફેરફાર`;
    if ((match = /^(\d+) guidance entries? checked locally$/.exec(value))) return `${match[1]} માર્ગદર્શન નોંધ સ્થાનિક રીતે ચિહ્નિત`;
    if ((match = /^(\d+) of (\d+) checked locally$/.exec(value))) return `${match[2]}માંથી ${match[1]} સ્થાનિક રીતે ચિહ્નિત`;
    if ((match = /^(\d+) source entries · review applicability$/.exec(value))) return `${match[1]} મૂળ નોંધો · લાગુ પડે છે કે નહીં તપાસો`;
    if ((match = /^(\d+) OF (\d+) ENTRIES$/.exec(value))) return `${match[2]}માંથી ${match[1]} નોંધો`;
    if ((match = /^Search all (\d+) redacted source entries\. Open an entry for its full actions, legal basis and citations\.$/.exec(value))) return `છુપાવેલી ઓળખ સાથેની ${match[1]} મૂળ નોંધો શોધો. સંપૂર્ણ કાર્યવાહી, કાનૂની આધાર અને સંદર્ભ માટે નોંધ ખોલો.`;
    if (value === 'Guidance includes required, conditional and reference material. Checklist changes stay in this browser, not the official case record.') return 'માર્ગદર્શનમાં ફરજિયાત, શરતી અને સંદર્ભ સામગ્રી છે. ચેકલિસ્ટના ફેરફારો આ બ્રાઉઝરમાં જ રહે છે; સત્તાવાર કેસ રેકોર્ડમાં નહીં.';
    if (value === 'Showing source groups related to this milestone. Check applicability; checklist changes stay in this browser.') return 'આ પગલાને સંબંધિત મૂળ નોંધો બતાવેલી છે. લાગુ પડે છે કે નહીં તપાસો; ચેકલિસ્ટના ફેરફારો આ બ્રાઉઝરમાં રહે છે.';
    return value;
  }
  function translate(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest('.source-original, script, style, [data-no-translate]')) continue;
      let state = originalText.get(node);
      if (!state || (node.textContent !== state.original && node.textContent !== state.translated)) state = { original: node.textContent, translated: node.textContent };
      const trimmed = state.original.trim();
      if (trimmed) state.translated = state.original.replace(trimmed, t(trimmed));
      node.textContent = state.translated;
      originalText.set(node, state);
    }
    const elements = root.querySelectorAll ? root.querySelectorAll('[placeholder], [aria-label], [title]') : [];
    for (const element of elements) {
      if (element.closest('.source-original, [data-no-translate]')) continue;
      if (!originalAttributes.has(element)) originalAttributes.set(element, Object.fromEntries(['placeholder', 'aria-label', 'title'].filter(name => element.hasAttribute(name)).map(name => [name, element.getAttribute(name)])));
      for (const [name, value] of Object.entries(originalAttributes.get(element))) element.setAttribute(name, t(value));
    }
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    const languageButtons = document.querySelectorAll('[data-language]');
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton) { themeButton.setAttribute('aria-pressed', String(theme === 'dark')); themeButton.setAttribute('aria-label', t(theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')); }
    const sourceNote = document.getElementById('source-language-note');
    if (sourceNote) sourceNote.hidden = language !== 'gu';
  }
  function setLanguage(next) {
    if (!['en', 'gu'].includes(next)) return;
    language = next;
    try { localStorage.setItem(languageKey, next); } catch (_) {}
    translate();
    document.dispatchEvent(new CustomEvent('vivechna:languagechange'));
  }
  function setTheme(next) {
    if (!['light', 'dark'].includes(next)) return;
    theme = next;
    try { localStorage.setItem(themeKey, next); } catch (_) {}
    translate();
  }
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  window.VivechnaPrefs = { t, translate, setLanguage, setTheme, get language() { return language; }, get theme() { return theme; }, step(step, field) { const values = guSteps[step.id]; return language === 'gu' && values ? (values[{ title: 0, brief: 1, why: 2 }[field]] || step[field]) : step[field]; } };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    document.getElementById('theme-toggle')?.addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
    translate();
  });
})();
