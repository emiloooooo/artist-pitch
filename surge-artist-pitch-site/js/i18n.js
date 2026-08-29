/* ===========================================================================
   Language layer — English (default) / German, switched live, no reload.

   How it works
   - The German copy stays in index.html and is the source of truth for the
     <body> markup. EN below is keyed by the data-i18n / data-i18n-html /
     data-i18n-attr attributes. Editing English = editing this file only.
   - The <head> is the exception: it ships English in the markup, because link
     previews, search engines and every other crawler never run this script.
     German head copy therefore lives in DE_HEAD further down, not in the DOM.
   - English is the default, so the first paint (German markup) is swapped to
     English by boot(). That swap happens behind the preloader, before the
     visitor taps to enter, so nothing visible flickers.
   - Order: ?lang=en|de  ->  explicitly saved choice  ->  en.
     Deliberately NOT auto-detected from the browser locale: a link has to
     render the same page for everyone.
   =========================================================================== */
(function () {
  'use strict';

  // Key bumped when the default flipped to English: the old key holds an
  // auto-written 'de' for every past visitor, which would pin them to German
  // forever. Only a real choice is stored under the new key.
  var STORE = 'nsat-lang-2';
  var DEFAULT_LANG = 'en';
  var LANGS = { en: 'English', de: 'Deutsch' };

  /* --- English copy ------------------------------------------------------- */
  var EN = {
    /* chrome */
    'pre.enter': 'Tap to enter',
    'nav.home': 'Nimmersatt, home',
    'nav.contact': 'Contact',
    'nav.menu': 'Open menu',

    /* hero */
    'hero.sub': 'Creatives are artists. We are an artist management agency for visual designers and moving image makers. We protect your visual language, make it bigger and bring you work, without bending you or your art out of shape.',
    'hero.m1': 'Artist Management',
    'hero.m2': 'Visual Design',
    'hero.m3': 'Creative Community',
    'hero.m4': 'Moving Image',

    /* about */
    'about.lead1': 'At nimmersatt we believe<br />in one simple truth:',
    'about.p1': 'The ideas we take in shape what we make. That is why every project starts with culture, not with content. Out of research, real insights and decoding a whole generation, we read what catches fire on its own and how the next generation actually works. That is how we bring brands in from the inside: they play along honestly instead of just broadcasting.',
    'about.p2': 'We are an artist management agency for visual designers and moving image makers: creative studio, management and production company in one. Instead of forcing projects into rigid agency structures, we build a dedicated team for every job from our circle of directors, designers, photographers, strategists, editors, developers and producers. Whether a project needs a single head or a full team from start to finish: the team is built around the brief, not the other way around.',
    'about.p3': 'In our network, old hands from the industry meet the next generation of creative voices. We put experienced heads together with young talent, and out of that comes work that combines craft with a fresh perspective and holds up at any scale and any budget.',
    'about.s1': 'What we make mirrors what we take in. We built a collective of Berlin’s strongest visual minds, found on the street and in the networks of the city.',
    'about.s2': 'Our artists are self-taught. Instead of university there was raw trial and error, and outdated processes mean nothing to them.',
    'about.s3': 'We do not just manage talent, we run the whole process, from the first input to the finished, cinematic result. The interface between established brands and the new generation.',
    'about.s4': 'Concept and production from one source. Versatile, precise, at any scale:',
    'about.svcLabel': 'What we do',
    'svc.1': 'Decoding generations',
    'svc.2': 'Brand identity',
    'svc.3': 'Creative direction',
    'svc.4': 'Personal branding',
    'svc.5': 'Treatment design',
    'svc.6': 'Fashion editorials',
    'svc.7': 'Sourcing & scouting',
    'svc.8': 'Graphic design',
    'svc.9': 'Motion design',
    'svc.10': 'Lookbooks',
    'svc.11': 'Concept & execution',
    'svc.12': 'Illustration & graphics',
    'svc.13': 'Heritage modernisation',
    'svc.14': 'Web experiences',

    /* workflow tool */
    'work.h': 'One workflow.<br />We’re still on it…',
    'work.lead': 'Our team is pulling night shifts in the backend to make this properly good. As soon as you are on the roster you get your account, and we help you find your people.',
    'work.l1': '01 / Every project in one place',
    'work.vidTitle': 'Nimmersatt workflow tool overview',
    'work.o1h': 'Your overview',
    'work.o1p': 'Every running project sits here with its phase, deadline and team. You always see what is moving, what is waiting and where you are needed right now.',
    'work.o2h': 'Your tasks',
    'work.o2p': 'Briefings turn into clear tasks, with owners and deadlines. You see exactly what Nimmersatt needs from you and what we take off your plate.',
    'work.l2': '02 / Built for the artist side',
    'work.alt1': 'Nimmersatt project dashboard: overview, deadlines and team',
    'work.s1t': 'Task view',
    'work.s1m': 'Briefings · Tasks · Approvals',
    'work.n1h': 'One shared source',
    'work.n1p': 'Files, feedback and approvals live on the project itself. No lost links, no voice notes buried somewhere, no three versions haunting separate chats.',
    'work.alt2': 'Nimmersatt AI assistant creating a task inside the tool',
    'work.s2t': 'AI AGENT',
    'work.s2m': 'STRUCTURE · PLAN · OVERVIEW',
    'work.n2h': 'Your own back office',
    'work.n2p': 'Your account is free. Setup takes a few minutes, and the structure is already there before you walk in. You take care of the work, not of yet another system.',

    /* the three pillars */
    'pil.h': 'Let’s talk about the elephant in the room. Where the hell is the catch?',
    'pil.1n': 'No exclusivity',
    'pil.1d': 'You are not signed away. Your own clients stay your clients, and nobody stops you from working outside the network. We ask for one thing only: anything that touches our name, our references and our contacts runs through us, for as long as we work together and one year beyond. We represent you worldwide, speak to clients with one voice and set your rates so that nobody sells you below your worth.',
    'pil.2n': 'Commission',
    'pil.2d': 'Twenty percent of the net fee, on projects we bring in. Nothing hides behind that. We set your day rate together, and nobody moves it alone, no discount over your head. Your money is there no later than thirty days after the client has paid us. And if a job goes sideways, the crew around you gets paid before anyone argues about the rest.',
    'pil.3n': 'Exit',
    'pil.3d': 'Open-ended, three months probation, then one month’s notice to the end of the month. No shackles, no ten-page exit. Anything already running is finished properly and settled, no matter who gives notice or why. The only thing that outlives the contract: for twelve months you do not take with you the clients we introduced you to.',

    /* contract chat */
    'ind.h': 'But please,<br />see for yourself',
    'ind.lead': 'Or read the 12,428 characters yourself. If you do, set a timer: there is a bet running on the roster about who gets through fastest.',
    'chat.meta': 'reads the whole contract for you',
    'chat.hello': 'Hey! I read the whole Nimmersatt contract so you don’t have to. Ask me anything: commission, exit, your rights, and I’ll keep it short.',
    'chat.ph': 'Ask about commission, exit, your rights…',
    'chat.aria': 'Message the nimmersatt Bot',
    'chat.send': 'Send message',
    'chat.offline': 'I’ve only got the Nimmersatt contract loaded right now — try “Summarize each paragraph of the contract”.',

    /* insurance funnel (Markel Pro Media) — the whole card since the sign-up
       form above it was removed on 2026-08-23 */
    'ins.eyebrow': 'Cover',
    'ins.lead': 'As a creator you are liable for your work, often with your private assets. Professional liability cover for media work (Markel Pro Media) catches exactly that. Ask the chat whatever you want to know: it explains the whole product, works out a rough ballpark live and takes your enquiry along the way.',
    'ins.title': 'Liability insurance',
    'ins.hint': 'only for artists with a German billing address',
    'ins.brandMeta': 'Professional liability · Markel Pro Media',
    'ins.brandTag': 'Cover',
    'ins.answerAria': 'Your answer',
    'ins.answerSend': 'Send answer',
    'ins.noteEyebrow': 'Before you start',
    'ins.noteTitle': 'Only for artists with a billing address in Germany',
    'ins.noteText': 'Markel Pro Media is a German insurance product. It requires you to be registered in Germany and to have a billing address in Germany. If that is not you: start the chat anyway. The first question settles exactly that and then shows you the route via § 12.7 of the contract.',
    'ins.noteOk': 'Got it',
    'ins.nudge': 'Quick aside, because you are really in it: § 12.7 gives you four weeks to show us how you are covered against late delivery. The insurance chat right below this one (“Liability insurance”) explains the whole thing and sorts it out in a few minutes.',

    /* insurance funnel — the cover, answered by the bot on request (topics()
       in js/funnel.js). Same content the static list used to hold. */
    'ins.info.intro': 'Just ask me whatever you want to know. Or we get going right away and I work out a ballpark for you.',
    'ins.info.fine': 'One thing up front: none of this is insurance or legal advice, a binding premium or a promise of acceptance. It only becomes binding with the reviewed offer from Markel.',
    'ins.info.all': 'Just show me everything',
    'ins.info.start': 'Go on, work out the price',
    'ins.info.wrap': 'That is everything I have on it. Shall we do the numbers?',

    'ins.info.what.q': 'What is this, exactly?',
    'ins.info.what.1': 'This is professional liability cover for media work, Markel Pro Media. NIMMERSATT arranges it, Markel carries the risk.',
    'ins.info.what.2': 'It is meant for artists who are registered in Germany and whose billing address is in Germany. Without both, this partner cannot make you an offer. In that case I take you into the § 12.7 branch, which is what my first question settles.',
    'ins.info.what.3': 'It covers pure financial loss caused by your work, above all late delivery and poor delivery. Injury, property and rented-property damage on set, on location or in the office come on top as optional public liability.',
    'ins.info.what.4': 'Fields: video, film & content · graphic, web & design · marketing & media agency · writing, editorial & publishing · music, audio & events · consulting / services.',

    'ins.info.cost.q': 'What does it cost?',
    'ins.info.cost.1': 'The estimate in this chat is built from your field, your annual net revenue (up to €50,000, €100,000, €250,000, €500,000 or above), the sum insured, the deductible and the add-ons you pick. With a floor of €120 a year. It is an order of magnitude, not a Markel premium.',
    'ins.info.cost.2': 'Sum insured for financial loss: €300,000, €500,000, €1m (recommended), €2m, €5m or €10m.',
    'ins.info.cost.3': 'Deductible: €0, €250, €500 or €1,000 per claim. A higher deductible means a lower premium.',
    'ins.info.cost.4': 'Public liability optionally on top, €3m or €5m combined for injury, property and rented-property damage.',
    'ins.info.cost.5': 'Add-ons, all optional: cyber & own data loss approx. €96/yr · own damage cover approx. €72/yr · print own damage approx. €48/yr · extended event cover up to 250 people approx. €84/yr · D&O external liability approx. €60/yr.',
    'ins.info.cost.6': 'Term of 1 year or 3 years, both renew automatically. Payment yearly (no surcharge), half-yearly or quarterly, there is no monthly option. Cover starts on the date you ask for.',

    'ins.info.ask.q': 'What will you ask me?',
    'ins.info.ask.1': 'First the tariff and the cover, then the risk questions: claims or pending disputes in the last 3 to 5 years, circumstances you already know of that could turn into future claims, a business founded in the last 12 months, your previous insurer with expiry date and reason for cancellation, the share of your revenue from the USA and Canada, and excluded activities.',
    'ins.info.ask.2': 'Your details come last: legal form, company name, salutation, first and last name, email, phone, website or social profile, street and house number, postcode and city. No bank details, no IBAN, no direct debit mandate.',
    'ins.info.ask.3': 'What goes out when you send it is a non-binding application enquiry, not a policy. You get a reference number, NIMMERSATT checks your details, obtains the binding Markel offer and comes back to you. Before anything is concluded you receive the general terms (AVB), the insurance product information document (IPID) and the 14-day right of withdrawal notice. Your statements have to be truthful and complete (§ 19 (5) German Insurance Contract Act, VVG).',
    'ins.info.ask.4': 'Not in the standard tariff: architecture or engineering with site supervision, investment and financial advice, and the design of weapons systems or nuclear facilities. There is a special scheme for those, and you can still send the enquiry.',

    'ins.info.why.q': 'Why do I need this?',
    'ins.info.why.1': '§ 12.5: if late or poor delivery on your side causes a financial loss, you are liable for it. That liability is capped at the sum insured of your professional liability cover plus your project fee. It only reaches your private assets in cases of intent, gross negligence, or where the insurer does not pay.',
    'ins.info.why.2': '§ 12.7: within four weeks of a concrete offer reaching you, you show us one of three things: a) professional liability cover for late and poor delivery, b) an existing policy with comparable scope, or c) that you carry the liability yourself. So there is no obligation to buy, the insurance is simply the easiest of the three doors.',
    'ins.info.why.3': '§ 14.4: if NIMMERSATT is liable towards an agency or an end client for a mistake of yours, there is an internal right of recourse, as far as you are responsible for the breach.',

    /* the short door: name + mail instead of the questionnaire (signupFlow) */
    'ins.su.chip': 'Just sign me up',
    'ins.su.intro1': 'Short version: all I need is your name and your email address.',
    'ins.su.intro2': 'The insurer then goes through the rest with you personally, so you can skip the questions in here. Your details go to NIMMERSATT and nowhere else.',
    'ins.su.askName': 'What is your name?',
    'ins.su.phName': 'First and last name',
    'ins.su.errName': 'Please put in your name.',
    'ins.su.askMail': 'And which email address do we reach you on?',
    'ins.su.phMail': 'name@mail.com',
    'ins.su.cancel': 'Actually, do the numbers',
    'ins.su.sending': 'One second, putting you down…',
    'ins.su.done1': 'Done. You are on the list: {name}, {mail}.',
    'ins.su.done2': 'The insurer gets in touch with you personally and sorts out tariff, cover and premium with you directly. Reference: {ref}.',
    'ins.su.after': 'Want a rough idea of the cost in the meantime anyway?',
    'ins.su.afterYes': 'Yes, do the numbers',
    'ins.su.afterNo': 'No, that is fine',
    'ins.su.bye': 'All good. Stay hungry.',
    'ins.su.fail1': 'Putting you down did not work just now, and that is not on you.',
    'ins.su.fail2': 'Send us your details directly, then nothing gets lost:',
    'ins.su.mailSubject': 'Liability insurance: please get in touch',
    'ins.su.mailBody': 'Name: {name}\nEmail: {mail}\n\nPlease get in touch with me about the professional liability cover.',
    'ins.su.mailBtn': 'Email hello@nimmersatt.fyi',
    'ins.su.retry': 'Try again',

    /* insurance funnel — the chat itself (js/funnel.js) */
    'ins.typing': 'typing',
    'ins.ph.default': 'Your answer…',
    'ins.yes': 'Yes',
    'ins.no': 'No',
    'ins.next': 'Next',
    'ins.skip': 'Skip',
    'ins.skipped': '— skipped —',
    'ins.recommended': '(recommended)',
    'ins.upTo': 'up to {v}',
    'ins.over': 'over {v}',

    'ins.prof.video': 'Video, film & content',
    'ins.prof.design': 'Graphic, web & design',
    'ins.prof.agency': 'Marketing & media agency',
    'ins.prof.text': 'Writing, editorial & publishing',
    'ins.prof.music': 'Music, audio & events',
    'ins.prof.consulting': 'Consulting / services',

    'ins.cov.vsh': 'Sum insured',
    'ins.cov.sb': 'Deductible',
    'ins.cov.bhp': 'incl. public liability',
    'ins.cov.bhp3': '€3m',
    'ins.cov.bhp5': '€5m',
    'ins.cov.mod1': 'add-on',
    'ins.cov.modN': 'add-ons',

    'ins.mod.cyber.n': 'Cyber & own data loss',
    'ins.mod.cyber.d': 'Hacking, data recovery, GDPR crisis',
    'ins.mod.own.n': 'Own damage cover',
    'ins.mod.own.d': 'Project withdrawal, reputation, phishing',
    'ins.mod.print.n': 'Print own damage',
    'ins.mod.print.d': 'Faulty print runs',
    'ins.mod.event.n': 'Extended event cover',
    'ins.mod.event.d': 'Events for third parties, up to 250 people',
    'ins.mod.doe.n': 'D&O external liability',
    'ins.mod.doe.d': 'Personal liability as an officer',
    'ins.mod.price': '+ approx. €{n}/yr',
    'ins.mods.one': '{n} add-on on top',
    'ins.mods.many': '{n} add-ons on top',
    'ins.mods.none': 'No add-ons',

    'ins.doc.title': 'Professional liability, the essentials',
    'ins.doc.meta': 'Markel Pro Media · overview · PDF in German',
    'ins.doc.open': 'Open',
    'ins.doc.save': 'Save',

    'ins.est.tag': 'Non-binding estimate',
    'ins.est.approx': 'approx.',
    'ins.est.year': 'year',
    'ins.est.half': 'half-yearly',
    'ins.est.quarter': 'quarterly',
    'ins.est.basis': 'Not a binding Markel premium, that one comes after the review.',
    'ins.est.rates': 'Instalments shown without a surcharge.',
    'ins.rev.prof': 'Field',
    'ins.rev.cover': 'Cover',
    'ins.rev.premium': 'Estimated premium',

    'ins.consent.vvg': 'My statements are truthful and complete (§ 19 (5) German Insurance Contract Act, VVG).',
    'ins.consent.avb': 'Before any policy is concluded I will receive the general terms (AVB), the insurance product information document (IPID) and the 14-day right of withdrawal notice.',
    'ins.consent.dsgvo': 'I consent to my data being processed to handle this enquiry under the GDPR.',
    'ins.submit.request': 'Send enquiry',
    'ins.err.consents': 'Please confirm all three mandatory notices to send it.',
    'ins.err.empty': 'Please fill this in briefly.',
    'ins.err.email': 'Please enter a valid email address.',
    'ins.err.percent': 'Please enter a number from 0 to 100.',
    'ins.err.send': 'That didn’t work just now. Just write to us at hello@nimmersatt.fyi.',
    'ins.sending.request': 'One second, sending this off…',
    'ins.sending.declaration': 'One second, writing this down…',
    'ins.done.sent': 'Thanks, your enquiry is out. We check your details, get the binding Markel offer and come back to you.',
    'ins.ref': 'Reference: {ref}. Until then: stay hungry.',

    'ins.q.hello1': 'Hey, I’m the nimmersatt Bot. I have everything on professional liability cover for media work right here, and I work out live roughly what it costs.',
    'ins.q.hello2': 'First, everything that matters about the cover as a PDF, to read whenever you like:',
    'ins.q.gate1': 'One thing up front, otherwise I work out a price you cannot actually get: Markel Pro Media is a product under German law.',
    'ins.q.gate2': 'Are you registered in Germany for your work, and is your billing address in Germany as well?',
    'ins.q.gateYes': 'Yes, both in Germany',
    'ins.q.gateNo': 'No, or billing address abroad',
    'ins.q.prof': 'Good. Let’s go: which field are you mostly working in?',
    'ins.q.revenue': 'And roughly what net revenue do you make in a year?',
    'ins.q.vsh': 'How high should the sum insured for pure financial loss be?',
    'ins.q.sb': 'Do you want a deductible per claim? A higher deductible means a lower premium.',
    'ins.q.sbNone': '(no deductible)',
    'ins.q.bhp': 'Should physical damage be included too? Injury, property and rented-property damage on set, on location or in the office (public liability).',
    'ins.q.bhpNo': 'No, financial loss only',
    'ins.q.bhpYes': 'Yes, physical damage too',
    'ins.q.bhpsum': 'What limit for injury & property damage?',
    'ins.q.bhpsum3': '€3 million combined',
    'ins.q.bhpsum5': '€5 million combined',
    'ins.q.modules': 'There are optional add-ons. Tap what you need, or go straight on.',
    'ins.q.estimate': 'Right, a rough ballpark based on what you told me:',
    'ins.q.claims': 'Now a few short risk questions so the review runs cleanly. In the last 3 to 5 years, were there any liability claims, financial or own losses, or pending disputes out of your work?',
    'ins.q.claimsDetail': 'Please describe those claims briefly: date, amount, cause and settlement status.',
    'ins.ph.claims': 'Date, amount, cause, status',
    'ins.q.known': 'Are you currently aware of any circumstances or cases that could lead to future claims against you?',
    'ins.q.knownDetail': 'Please describe it briefly.',
    'ins.ph.known': 'Short description',
    'ins.q.startup': 'Was your business founded in the last 12 months?',
    'ins.q.startupYes': 'Yes, newly founded',
    'ins.q.prev': 'Did you already have equivalent professional liability cover directly before this application?',
    'ins.q.prevInsurer': 'Which insurer were you with?',
    'ins.ph.prevInsurer': 'Name of the previous insurer',
    'ins.q.prevEnd': 'And the expiry date?',
    'ins.ph.date': 'DD.MM.YYYY',
    'ins.q.prevReason': 'What was the reason for cancellation?',
    'ins.ph.prevReason': 'Reason for cancellation',
    'ins.q.us': 'Do you make revenue with direct clients in the USA or Canada, or do you work there on site?',
    'ins.q.usShare': 'How high is the US/Canada share of your revenue, roughly in percent?',
    'ins.ph.usShare': 'e.g. 15',
    'ins.q.excl': 'Do you work as an architect or engineer with site supervision, in investment or financial advice, or on the design of weapons systems or nuclear facilities?',
    'ins.q.exclNote': 'Understood. Those activities are excluded from the standard tariff, so we pass you on to a suitable special scheme. You can still send your enquiry.',
    'ins.q.legalForm': 'Nearly there. Just your details for the enquiry now. What legal form do you have?',
    'ins.lf.freelance': 'Freelancer',
    'ins.lf.sole': 'Sole trader',
    'ins.lf.other': 'Other',
    'ins.q.company': 'Is there a company or business name?',
    'ins.ph.company': 'Company name (optional)',
    'ins.q.salutation': 'How should we address you?',
    'ins.sal.f': 'Ms',
    'ins.sal.m': 'Mr',
    'ins.sal.d': 'Non-binary',
    'ins.sal.none': 'Prefer not to say',
    'ins.q.first': 'What is your first name?',
    'ins.ph.first': 'First name',
    'ins.q.last': 'And your last name?',
    'ins.ph.last': 'Last name',
    'ins.q.email': 'Which email should we send the offer to?',
    'ins.ph.email': 'name@mail.com',
    'ins.q.phone': 'Phone or mobile in case of questions? You can skip this.',
    'ins.ph.phone': 'Phone / mobile (optional)',
    'ins.q.website': 'Website or social profile for verification?',
    'ins.ph.website': 'e.g. instagram.com/… (optional)',
    'ins.q.street': 'Street and house number?',
    'ins.ph.street': 'Street and house number (optional)',
    'ins.q.city': 'Postcode and city?',
    'ins.ph.city': 'Postcode, city (optional)',
    'ins.q.term': 'What term would you like? Both renew automatically.',
    'ins.q.term1': '1 year',
    'ins.q.term3': '3 years',
    'ins.q.interval': 'And the payment interval?',
    'ins.q.intYear': 'Yearly (no surcharge)',
    'ins.q.intHalf': 'Half-yearly',
    'ins.q.intQuarter': 'Quarterly',
    'ins.q.start': 'When should the cover start?',
    'ins.ph.start': 'immediately or DD.MM.YYYY (optional)',
    'ins.q.review': 'Perfect. Your summary in short:',
    'ins.q.consents': 'To send it, please confirm the three mandatory notices:',

    'ins.ab.q1a': 'Thanks for answering honestly. Then our partner cannot make you an offer: Markel Pro Media requires a German registration and a German billing address.',
    'ins.ab.q1b': 'The contract knows this case though. § 12.7 gives you four weeks to tell us how you are covered instead. Two ways, both completely fine:',
    'ins.ab.optInsured': 'I have comparable cover where I am',
    'ins.ab.optPersonal': 'I carry the liability myself',
    'ins.ab.country': 'Which country is your billing address in?',
    'ins.ab.countryPh': 'e.g. Austria',
    'ins.ab.insurer': 'Which insurer are you with there? You can skip this.',
    'ins.ab.insurerPh': 'Name of the insurer (optional)',
    'ins.ab.first': 'Then let me note that down for you. What is your first name?',
    'ins.ab.email': 'Which email should we use?',
    'ins.ab.consentIntro': 'One tick and it goes out:',
    'ins.ab.noted': 'Noted. That gives us your answer under § 12.7, inside the four weeks.',
    'ins.ab.proof': 'One thing is still missing: send us the policy or the confirmation of cover to hello@nimmersatt.fyi and it is complete.',
    'ins.ab.personal': 'In plain terms: for damage from late or poor delivery you are liable yourself under § 12.5, capped at your project fee, and beyond that only for intent or gross negligence.',
    'ins.ab.consent': 'I consent to my data being processed to document this declaration under the GDPR.',
    'ins.ab.submit': 'Send declaration',
    'ins.ab.errConsent': 'Please confirm the notice to send it.',

    /* code of conduct */
    'cc.lead': 'Honestly, we all know it… You are what you eat. So don’t eat crap and don’t let anyone sell you any. Stay real, with yourself and with everyone around you.',
    'cc.1l': 'Culture, craft & quality',
    'cc.1a': '<strong>Understand first, then make:</strong> Dive into the brief and into the culture, no empty noise, only work that actually lands with modern communities.',
    'cc.1b': '<strong>Cinematic standard:</strong> Whether strategy, set, design or post, hold a high-end, cinematic standard everywhere, at every budget.',
    'cc.2l': 'Responsibility & respect in the team',
    'cc.2a': '<strong>Think across generations:</strong> Bring experienced heads and young perspectives together, with respect and openness in both directions.',
    'cc.2b': '<strong>Lean execution:</strong> Work directly, without agency ballast, own your part and bring real value to every result.',
    'cc.3l': 'Straight talk & growing together',
    'cc.3a': '<strong>Speak up early:</strong> Say something early when capacity, limits or bottlenecks start to press, before a small thing turns into a production problem.',
    'cc.3b': '<strong>Career, not just calendar:</strong> Stick to clear briefs and deadlines, and use every job to push your portfolio and the work of the collective forward.',
    'cc.signoff': 'Always hungry. Never full.',

    /* collective */
    'ros.h': 'Don’t fight over the crumbs. Let’s bake the cake together.',
    'ros.lead': 'We are not a roster. The people here film each other’s work, lend each other crew and hold the same minimum rate. Nobody fights over the same three jobs, because everyone brings in different ones.',
    'ros.discord': 'connect with the community before you’re even in',
    'ros.contract': 'Contract',
    'ros.contractR': 'the full contract is here to download',
    'ros.pack': 'Package',
    'ros.packR': 'save this one for the call. good of you to look in',
    'ros.expect': 'What we expect from you',
    'ros.p1n': 'Authenticity',
    'ros.p1r': 'just stay yourself',
    'ros.p2n': 'Reliability',
    'ros.p2r': 'trust the freedom',
    'ros.p3n': 'Appetite',
    'ros.p3r': 'make something of it',

    /* clients */
    'cli.h': 'Where your work can end up',

    /* closing */
    'clo.h': 'We read the room before we set the table.',
    'clo.lead': 'We answer. You work.<br />We handle it. You keep going.<br />We negotiate. You create.',
    'clo.1h': 'Land here',
    'clo.1p': 'Thanks for taking the time for nimmersatt, it was a real pleasure. That’s it from my side, from here it’s on you.<br />And that’s it for today. See you soon, hopefully!',
    'clo.1n': 'admin here: thanks, folks, seriously',
    'clo.2h': 'Make your decision',
    'clo.2p': 'If you’re up for it, pull your portfolio together and decide. The files themselves you send via Google Drive, swisstransfer or whatever your thing is.',
    'clo.3h': 'Book your slot',
    'clo.3p': 'Bring questions, feedback and thirty minutes. Our team meets you and goes through every detail.<br />until then: stay hungry, but humble',
    'clo.3cal': 'off to Calendly',
    'clo.cta': 'anything else',
    'doc.h': 'Documents',
    'doc.a1': 'Download artist agreement',
    'doc.a2': 'Download deal package',
    // In English the English name leads and the German title becomes the
    // sub-line; German mode reads the markup and flips back on its own.
    'doc.n1': 'Artist Agreement',
    'doc.s1': 'Künstlervertrag',
    'doc.n2': 'Deal Package',
    'doc.s2': 'Dealpaket',
    'foot.tag': 'Never full · Never finished',

    /* head */
    'meta.title': 'NIMMERSATT · Artist management for visual designers & moving image',
    'meta.desc': 'An artist management agency for visual designers and moving image makers. We protect your visual language, make your work bigger and bring you jobs.',
    'meta.alt': 'Nimmersatt: artist management for visual designers and moving image makers.'
  };

  /* Documents that exist in both languages. */
  var DOCS = {
    contract: {
      de: { href: 'assets/documents/nimmersatt-vertrag-de.download', name: 'NIMMERSATT-Vertrag-DE.pdf' },
      en: { href: 'assets/documents/nimmersatt-contract-en.download', name: 'NIMMERSATT-Contract-EN.pdf' }
    },
    deal: {
      de: { href: 'assets/documents/nimmersatt-dealpaket-de.download', name: 'NIMMERSATT-Dealpaket-DE.pdf' },
      en: { href: 'assets/documents/nimmersatt-deal-package-en.download', name: 'NIMMERSATT-Deal-Package-EN.pdf' }
    }
  };

  /* --- State -------------------------------------------------------------- */
  function stored() {
    try { return localStorage.getItem(STORE); } catch (_) { return null; }
  }
  function remember(l) {
    try { localStorage.setItem(STORE, l); } catch (_) { /* private mode */ }
  }
  // English is the default for everyone. Deliberately NOT auto-detected from
  // the browser locale: a page that silently changes language per visitor is
  // impossible to link to or to check. An explicit choice wins and is kept;
  // the resolved default is never written to storage, so flipping the default
  // later actually reaches returning visitors.
  function initial() {
    var q = /[?&]lang=(de|en)\b/i.exec(window.location.search);
    if (q) return { lang: q[1].toLowerCase(), explicit: true };
    var s = stored();
    if (s === 'de' || s === 'en') return { lang: s, explicit: true };
    return { lang: DEFAULT_LANG, explicit: false };
  }

  var current = 'de';

  /* --- Applying a language ------------------------------------------------ */
  // The German original is captured lazily the first time an element is
  // translated, so switching back is always byte-identical to the markup.
  function original(el, kind) {
    var slot = '__de_' + kind;
    if (el[slot] === undefined) {
      el[slot] = kind === 'html' ? el.innerHTML : el.textContent;
    }
    return el[slot];
  }
  function originalAttr(el, attr) {
    var slot = '__de_attr_' + attr;
    if (el[slot] === undefined) el[slot] = el.getAttribute(attr);
    return el[slot];
  }

  function t(key) {
    return (current === 'en' && EN[key] !== undefined) ? EN[key] : null;
  }

  // persist === false only for the resolved default on boot; every explicit
  // switch (menu, keyboard, ?lang=, window.nsatLang.set) is remembered.
  function apply(lang, persist) {
    current = (lang === 'en') ? 'en' : 'de';
    var en = current === 'en';

    document.documentElement.lang = current;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var de = original(el, 'text');
      el.textContent = (en && EN[k] !== undefined) ? EN[k] : de;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      var de = original(el, 'html');
      el.innerHTML = (en && EN[k] !== undefined) ? EN[k] : de;
    });

    // data-i18n-attr="placeholder:chat.ph;aria-label:chat.aria"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length !== 2) return;
        var attr = bits[0].trim(), k = bits[1].trim();
        var de = originalAttr(el, attr);
        var val = (en && EN[k] !== undefined) ? EN[k] : de;
        if (val !== null && val !== undefined) el.setAttribute(attr, val);
      });
    });

    // Bilingual PDFs follow the page language.
    document.querySelectorAll('[data-i18n-doc]').forEach(function (a) {
      var doc = DOCS[a.getAttribute('data-i18n-doc')];
      if (!doc) return;
      var pick = doc[current];
      a.setAttribute('href', pick.href);
      a.setAttribute('download', pick.name);
    });

    // Head: title + description, so shares and tabs match the page.
    // The markup ships English (see DE_HEAD), so German is the swapped-in side
    // here, not the other way round.
    document.title = en ? EN['meta.title'] : DE_HEAD.title;
    setMeta('name', 'description', en ? EN['meta.desc'] : DE_HEAD.desc);
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', en ? EN['meta.desc'] : DE_HEAD.desc);
    setMeta('property', 'og:locale', en ? 'en_GB' : 'de_DE');
    setMeta('property', 'og:image:alt', en ? EN['meta.alt'] : DE_HEAD.alt);
    setMeta('name', 'twitter:title', document.title);
    setMeta('name', 'twitter:description', en ? EN['meta.desc'] : DE_HEAD.desc);
    setMeta('name', 'twitter:image:alt', en ? EN['meta.alt'] : DE_HEAD.alt);

    if (persist !== false) remember(current);
    document.querySelectorAll('[data-lang-slot]').forEach(paint);
    document.dispatchEvent(new CustomEvent('nsat:langchange', { detail: { lang: current } }));
  }

  function setMeta(attr, name, value) {
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el && value) el.setAttribute('content', value);
  }

  // The <head> in index.html is English, because link previews, search engines
  // and every other crawler never run this script and would otherwise only ever
  // see German. So the German head copy cannot be read off the DOM any more, it
  // is spelled out here and swapped in when the page switches to German.
  var DE_HEAD = {
    title: 'NIMMERSATT · Artist-Management für visuelle Gestalter und Bewegtbild',
    desc: 'Eine Artist-Management-Agentur für visuelle Gestalter und Bewegtbild-Macher. Wir schützen deine Bildsprache, machen deine Arbeit größer und bringen dir Jobs.',
    alt: 'Nimmersatt: Artist-Management für visuelle Gestalter und Bewegtbild-Macher.'
  };

  /* --- The switcher ------------------------------------------------------- */
  // One component, mounted into every [data-lang-slot]: a button that opens a
  // small listbox. Both instances (hero + header) stay in sync through apply().
  function build(slot) {
    slot.innerHTML = '';
    slot.classList.add('langswitch');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'langswitch__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="langswitch__code"></span><span class="langswitch__caret" aria-hidden="true">↓</span>';

    var list = document.createElement('ul');
    list.className = 'langswitch__menu';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    Object.keys(LANGS).forEach(function (code) {
      var li = document.createElement('li');
      li.className = 'langswitch__opt';
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.dataset.lang = code;
      li.innerHTML = '<span class="langswitch__optcode">' + code.toUpperCase() + '</span>' +
                     '<span class="langswitch__optname">' + LANGS[code] + '</span>';
      li.addEventListener('click', function () { close(true); apply(code); });
      list.appendChild(li);
    });

    slot.appendChild(btn);
    slot.appendChild(list);

    function open() {
      list.hidden = false;
      slot.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      var sel = list.querySelector('[aria-selected="true"]') || list.firstChild;
      if (sel) sel.focus();
    }
    function close(focusBtn) {
      list.hidden = true;
      slot.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    }

    btn.addEventListener('click', function () {
      list.hidden ? open() : close(false);
    });
    slot.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(true); return; }
      if (list.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
        return;
      }
      var opts = Array.prototype.slice.call(list.children);
      var i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (opts[i - 1] || opts[opts.length - 1]).focus(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (i > -1) { e.preventDefault(); var c = opts[i].dataset.lang; close(true); apply(c); }
      }
    });

    document.addEventListener('click', function (e) {
      if (!slot.contains(e.target) && !list.hidden) close(false);
    });

    paint(slot);
  }

  function paint(slot) {
    var code = slot.querySelector('.langswitch__code');
    if (code) code.textContent = current.toUpperCase();
    var btn = slot.querySelector('.langswitch__btn');
    if (btn) btn.setAttribute('aria-label',
      current === 'en' ? 'Language: English. Change language' : 'Sprache: Deutsch. Sprache wechseln');
    slot.querySelectorAll('.langswitch__opt').forEach(function (li) {
      var on = li.dataset.lang === current;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      li.classList.toggle('is-current', on);
    });
  }

  /* --- Boot --------------------------------------------------------------- */
  function boot() {
    document.querySelectorAll('[data-lang-slot]').forEach(build);
    var start = initial();
    apply(start.lang, start.explicit);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.nsatLang = {
    get: function () { return current; },
    set: function (lang) { apply(lang, true); },
    t: function (key, fallbackDe) { var v = t(key); return v === null ? fallbackDe : v; }
  };
})();
