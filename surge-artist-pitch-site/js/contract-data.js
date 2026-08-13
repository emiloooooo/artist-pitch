/* ============================================================================
   NIMMERSATT — Contract data
   Single source of truth for the contract explorer (contract.html).

   STRUCTURE
     clauses[]  verbatim German contract text — the BINDING wording.
                Transcribed 1:1 from 260711_NIMMERSATT_Vertrag_DE.
                Do not paraphrase, shorten or "fix" anything in here.
     summary    plain-language explainer, DE + EN. NON-BINDING.
                This is the only part that may be rewritten for clarity.
     key[]      2–4 headline takeaways per section, DE + EN.

   Adding a language for the verbatim text: give each clause `text` an object
   keyed by lang ({ de: "…", en: "…" }) and read it the same way as summary.
   Deliberately NOT done yet — the English PDF is an older revision (§ 12.7
   differs materially), so shipping it as "the full contract" would contradict
   the German original.
   ========================================================================== */

window.CONTRACT_DATA = {
  meta: {
    revision: "11.07.2026",
    source: "assets/documents/nimmersatt-vertrag-de.download",
    sourceName: "NIMMERSATT-Vertrag-DE.pdf",
    parties: {
      de: "Diese Zusammenarbeitsbedingungen regeln das Vertragsverhältnis zwischen Otto Windmöller, Wilhelmstraße 3, 10963 Berlin – nachfolgend NIMMERSATT genannt – und den jeweiligen Vertragspartnern nachfolgend Artist genannt.",
      en: "These collaboration terms govern the contractual relationship between Otto Windmöller, Wilhelmstraße 3, 10963 Berlin — referred to as NIMMERSATT — and the respective contractual partner, referred to as Artist."
    },

    /* The whole contract in six lines — rendered into the sidebar. */
    tldr: {
      de: [
        "Kein Exklusivvertrag — eigene Projekte bleiben erlaubt (§ 0)",
        "20 % Management-Fee vom Netto-Honorar (§ 4, § 20)",
        "Auszahlung 30 Tage nach Zahlungseingang (§ 4.4)",
        "Urheberrecht bleibt bei dir — außer als Subunternehmer (§ 10)",
        "3 Monate Probezeit, dann 1 Monat zum Monatsende (§ 12)",
        "Berufshaftpflicht nachweisen oder persönlich haften (§ 12.7)"
      ],
      en: [
        "No exclusivity — your own projects stay allowed (§ 0)",
        "20 % management fee on the net fee (§ 4, § 20)",
        "Payout 30 days after the client pays (§ 4.4)",
        "Copyright stays yours — except as a subcontractor (§ 10)",
        "3-month trial, then 1 month to month's end (§ 12)",
        "Prove liability insurance or be personally liable (§ 12.7)"
      ]
    }
  },

  sections: [
    /* --- § 0 ------------------------------------------------------------- */
    {
      id: "p0",
      no: "0",
      title: {
        de: "Non-Exklusivität und freie Projektannahme",
        en: "Non-exclusivity and free project acceptance"
      },
      key: {
        de: [
          "Kein Exklusivvertrag — eigene Jobs bleiben erlaubt",
          "Kunden über NIMMERSATT: 12 Monate Abwerbeverbot",
          "Weltweite Vertretung, Partner-Agenturen nur mit Zustimmung",
          "Vertrag geht später auf eine NIMMERSATT-Gesellschaft über"
        ],
        en: [
          "No exclusivity — your own jobs stay yours",
          "Clients introduced via NIMMERSATT: 12-month non-solicit",
          "Worldwide representation, partner agencies need consent",
          "Contract will transfer to a future NIMMERSATT company"
        ]
      },
      summary: {
        de: "Du bist nicht exklusiv gebunden: eigene Projekte und Auftraggeber darfst du frei annehmen und selbst abwickeln. Die Grenze ist alles, was mit NIMMERSATT zusammenhängt — Name, Branding, Referenzen, Infrastruktur und Ressourcen darfst du für Projekte am Management vorbei nicht nutzen. Kunden, die nachweislich über NIMMERSATT kamen, darfst du während der Zusammenarbeit und 12 Monate danach nicht aktiv abwerben; fragt so ein Kunde dich direkt als Freelancer an, musst du die Anfrage weiterleiten und vorher eine schriftliche Freigabe einholen, die nicht unbillig verweigert werden darf. Kunden ohne jeden Bezug zu NIMMERSATT sind davon nicht betroffen. Die Vertretung gilt weltweit, und Verträge mit Managements oder Agenturen in anderen Regionen brauchen vorab die schriftliche Zustimmung der Geschäftsführung. Vertragspartner ist derzeit Otto Windmöller als Privatperson — du stimmst schon jetzt zu, dass der Vertrag auf eine noch zu gründende NIMMERSATT-Gesellschaft übergeht, zu unveränderten Konditionen und mit 14 Tagen Widerspruchsrecht ab der Mitteilung.",
        en: "You are not bound exclusively: you may freely accept and run your own projects and clients. The limit is anything connected to NIMMERSATT — you may not use its name, branding, references, infrastructure or resources for projects routed around the management. Clients demonstrably introduced through NIMMERSATT may not be actively solicited during the collaboration or for 12 months afterwards; if such a client approaches you directly as a freelancer, you must forward the enquiry and obtain written clearance first, which may not be unreasonably withheld. Clients you met with no connection to NIMMERSATT are unaffected. Representation is worldwide, and contracts with managements or agencies in other regions require prior written consent from NIMMERSATT's management. Your counterparty is currently Otto Windmöller as a private individual — you agree in advance that the contract will transfer to a NIMMERSATT company yet to be founded, on unchanged terms and with a 14-day right to object once notified."
      },
      clauses: [
        {
          no: "0.1",
          text: "Es besteht kein exklusives Management- oder Vertretungsverhältnis zwischen NIMMERSATT und dem Artist. Dem Artist steht es grundsätzlich völlig frei, eigene Projekte, Aufträge und Engagements für Dritte anzunehmen und eigenständig abzuwickeln."
        },
        {
          no: "0.2",
          text: "Die in „§ 0.1“ gewährte Freiheit zur Eigenproduktion gilt ausdrücklich nicht für Projekte oder Anfragen, die in einem direkten oder indirekten Zusammenhang mit NIMMERSATT stehen. Es ist dem Artist strengstens untersagt, für eigenständige – an NIMMERSATT vorbeigeführte – Projekte auf Folgendes zurückzugreifen oder dieses zu nutzen:",
          bullets: [
            "Den Namen, das Branding oder die Referenzen von NIMMERSATT.",
            "Gegenwärtige oder vergangene Dienstleistungen, Infrastrukturen oder Ressourcen von NIMMERSATT.",
            "Der Artist verpflichtet sich, für die Dauer von 12 Monaten nach Beendigung keine Kunden aktiv abzuwerben oder direkt zu kontaktieren, die nachweislich während der Zusammenarbeit konkret über NIMMERSATT vermittelt oder eingeführt wurden.",
            "Wird der Artist während der Zusammenarbeit oder innerhalb von 12 Monaten nach deren Beendigung von einem Kunden, der ihm nachweislich über NIMMERSATT vermittelt oder eingeführt wurde, unmittelbar als Freelancer angefragt, ist der Artist verpflichtet, die Anfrage unverzüglich an NIMMERSATT weiterzuleiten und vor Annahme eine schriftliche Freigabe einzuholen. Die Freigabe darf nicht unbillig verweigert werden. Kunden, mit denen der Artist nachweislich ohne jeden Bezug zu NIMMERSATT in Kontakt kam, bleiben hiervon unberührt."
          ],
          after: "Diese Beschränkung gilt für die Dauer dieses Vertrages sowie für einen Zeitraum von 12 Monaten nach Beendigung der Zusammenarbeit, um eine unbillige oder sittenwidrige nachvertragliche Beschränkung zu vermeiden."
        },
        {
          no: "0.3",
          text: "Die Zusammenarbeit zwischen NIMMERSATT und dem Artist ist geografisch auf eine weltweite und globale Vertretung ausgelegt. NIMMERSATT repräsentiert den Artist somit international und überregional für alle über das Netzwerk generierten oder betreuten Projekte."
        },
        {
          no: "0.4",
          text: "NIMMERSATT erachtet es als prinzipiell wünschenswert und strategisch sinnvoll, mit Partner-Managements oder Agenturen in anderen globalen Regionen (z. B. USA, Asien, UK) zusammenzuarbeiten, um den Artist dort gezielt zu platzieren und zu spezifizieren. Um eine konsistente Markenführung und Preis Harmonie zu gewährleisten, vereinbart der Artist mit NIMMERSATT ein vorheriges Mitsprache- und Zustimmungserfordernis: Dem Artist ist es erst nach ausdrücklicher, schriftlicher (oder in Textform erteilter) Zustimmung durch die Geschäftsführung von NIMMERSATT gestattet, Verträge mit anderen Managements, Agenturen oder Repräsentanzen in anderen Regionen zu unterzeichnen. NIMMERSATT ist berechtigt, solche Kooperationen an Bedingungen zu knüpfen oder abzulehnen, wenn sie den operativen Interessen oder dem Image des bestehenden Netzwerks widersprechen."
        },
        {
          no: "0.5",
          text: "NIMMERSATT im Sinne dieses Vertrags ist gegenwärtig Otto Windmöller als natürliche Person. Otto Windmöller beabsichtigt, das unter der Bezeichnung NIMMERSATT geführte Geschäft künftig in eine noch zu gründende Gesellschaft einzubringen. Rechtsform (z. B. GbR, UG oder GmbH) und genaue Firmierung (z. B. NIMMERSATT, \"Nimmersatt Video\", \"Nimmersatt Produktion\" oder ähnlich) stehen zum Zeitpunkt des Vertragsschlusses noch nicht fest und werden erst mit der Gründung festgelegt."
        },
        {
          no: "0.6",
          text: "Der Artist stimmt bereits jetzt zu, dass sämtliche Rechte und Pflichten aus diesem Vertrag im Wege der Vertragsübernahme auf eine solche Gesellschaft übergehen, sobald diese gegründet ist. Voraussetzung ist, dass die Gesellschaft von Otto Windmöller gegründet oder mitgegründet wird, Otto Windmöller an ihr als Gesellschafter beteiligt ist und die Gesellschaft das bisherige Nimmersatt-Geschäft fortführt. Die übernehmende Gesellschaft ist dadurch eindeutig bestimmbar, auch wenn Firmierung und Rechtsform bei Vertragsschluss noch offen sind."
        },
        {
          no: "0.7",
          text: "Die Bedingungen dieses Vertrags bleiben durch den Übergang unverändert. Honorare, Fees, Provisionen, Laufzeit und Kündigungsrechte des Artists ändern sich nicht zu seinen Lasten. Wirtschaftlich verantwortlicher Ansprechpartner bleibt Otto Windmöller."
        },
        {
          no: "0.8",
          text: "Nimmersatt teilt dem Artist den Übergang in Textform mit, unter Angabe von Firmierung, Rechtsform und Wirksamkeitsdatum. Der Artist ist berechtigt, dem Übergang innerhalb von 14 Tagen nach Zugang dieser Mitteilung in Textform zu widersprechen. Widerspricht der Artist, bleibt Otto Windmöller persönlich Vertragspartei; beiden Seiten steht in diesem Fall ein Sonderkündigungsrecht mit einer Frist von einem Monat zum Monatsende zu."
        },
        {
          no: "0.9",
          text: "Bis zum wirksamen Übergang bleibt Otto Windmöller persönlich Vertragspartei mit allen Rechten und Pflichten aus diesem Vertrag."
        }
      ]
    },

    /* --- § 1 ------------------------------------------------------------- */
    {
      id: "p1",
      no: "1",
      title: {
        de: "Gegenstand und Geltungsbereich",
        en: "Subject matter and scope"
      },
      key: {
        de: [
          "Gilt für Artists im Bereich Bewegtbild/Video",
          "Deckt alle jetzigen und künftigen Leistungen ab"
        ],
        en: [
          "Applies to artists in moving image / video",
          "Covers all current and future services"
        ]
      },
      summary: {
        de: "Legt fest, worum es überhaupt geht: die Zusammenarbeit zwischen NIMMERSATT und Artists im Bereich Bewegtbild/Video, die das Management für Projektmanagement, Akquise, Verhandlung, Kommunikation und den Zugang zum internen Netzwerk beauftragen. Die Bedingungen gelten automatisch für alle laufenden und zukünftigen Leistungen — es sei denn, ihr vereinbart im Einzelfall schriftlich etwas anderes.",
        en: "Defines what the agreement covers: the collaboration between NIMMERSATT and artists in moving image / video who engage the management for project management, acquisition, negotiation, communication and access to the internal network. The terms automatically apply to all current and future services — unless you agree otherwise in writing in an individual case."
      },
      clauses: [
        {
          no: "1.1",
          text: "Diese Zusammenarbeitsbedingungen regeln die vertragliche Beziehung zwischen Nimmersatt (nachfolgend NIMMERSATT) und Artists im Bereich Bewegtbild/Video (nachfolgend „Artist“), die NIMMERSATT für Dienstleistungen rund um Projektmanagement, Akquise, Verhandlung und Kommunikation sowie die Nutzung des internen Netzwerks beauftragen."
        },
        {
          no: "1.2",
          text: "Die Bedingungen gelten für alle gegenwärtigen und zukünftigen Leistungen im Rahmen der Zusammenarbeit, sofern nicht im Einzelfall schriftlich abweichend vereinbart."
        }
      ]
    },

    /* --- § 2 ------------------------------------------------------------- */
    {
      id: "p2",
      no: "2",
      title: {
        de: "Projektvermittlung und Management",
        en: "Project mediation and management"
      },
      key: {
        de: [
          "NIMMERSATT vermittelt, du produzierst",
          "Keine Garantie auf Projekte oder Auslastung"
        ],
        en: [
          "NIMMERSATT brokers, you produce",
          "No guarantee of projects or workload"
        ]
      },
      summary: {
        de: "Die Rollenverteilung: NIMMERSATT agiert als Management und vermittelt Bewegtbild-Projekte, die Umsetzung liegt bei dir. Art und Umfang deiner Leistungen legt ihr gemeinsam fest, und du sicherst zu, fachlich dafür qualifiziert zu sein. Wichtig für die Erwartungshaltung: Es gibt ausdrücklich keine Garantie auf eine bestimmte Anzahl Projekte und keine Auslastungsgarantie.",
        en: "The division of roles: NIMMERSATT acts as management and brokers moving-image projects; execution is on you. The type and scope of your services are agreed jointly, and you warrant that you are professionally qualified for them. Important for expectations: there is explicitly no guarantee of any number of projects and no workload guarantee."
      },
      clauses: [
        {
          no: "2.1",
          text: "Der Artist beauftragt NIMMERSATT mit der Vermittlung von Bewegtbild-Projekten. Art und Umfang der vom Artist angebotenen Dienstleistungen werden in gegenseitiger Absprache festgelegt."
        },
        {
          no: "2.2",
          text: "NIMMERSATT agiert als Management. Die Umsetzung der Videoprojekte obliegt dem Artist."
        },
        {
          no: "2.3",
          text: "Der Artist sichert zu, dass er über alle notwendigen fachlichen Qualifikationen verfügt, um die vermittelten Projekte vertragsgemäß umzusetzen."
        },
        {
          no: "2.4",
          text: "NIMMERSATT ist nicht verpflichtet, eine bestimmte Anzahl an Projekten zu vermitteln. Eine Auslastungs- oder Vermittlungsgarantie besteht nicht."
        }
      ]
    },

    /* --- § 3 ------------------------------------------------------------- */
    {
      id: "p3",
      no: "3",
      title: {
        de: "Datenübermittlung, Reise und Gefahrtragung",
        en: "Data transfer, travel and risk"
      },
      key: {
        de: [
          "Datenübergabe und Reisekosten liegen bei dir",
          "Backups sind Pflicht — vor jeder Übergabe",
          "NIMMERSATT haftet nur bei grober Fahrlässigkeit/Vorsatz"
        ],
        en: [
          "Data delivery and travel costs are on you",
          "Redundant backups are mandatory before handover",
          "NIMMERSATT liable only for gross negligence/intent"
        ]
      },
      summary: {
        de: "Rohdaten und finale Videos an Kunden oder an NIMMERSATT zu übermitteln ist deine Verantwortung, ebenso produktionsbedingte Transport- und Reisekosten — außer sie werden dem Endkunden in Rechnung gestellt. Die finale Auslieferung betreut NIMMERSATT administrativ. Sobald du Festplatten oder physisches Material übergibst, geht die Obhutspflicht auf NIMMERSATT über. Für Datenverlust haftet NIMMERSATT allerdings nur bei grober Fahrlässigkeit oder Vorsatz — und du bist verpflichtet, vor jeder Datenübergabe redundante Backups anzulegen.",
        en: "Getting raw footage and final videos to clients or to NIMMERSATT is your responsibility, as are production-related transport and travel costs — unless they are billed to the end client. Final delivery is administered by NIMMERSATT. Once you hand over hard drives or physical production material, the duty of care passes to NIMMERSATT. However, NIMMERSATT is liable for data loss only in cases of gross negligence or intent — and you are required to create redundant backups before every handover."
      },
      clauses: [
        {
          no: "3.1",
          text: "Die Übermittlung von Rohdaten und finalen Videos (Datenübertragung, Festplatten) an Kunden oder NIMMERSATT liegt in der Verantwortung des/der Artists. Produktionsbedingte Transport- oder Reisekosten trägt der/die Artist, sofern sie nicht dem Endkunden in Rechnung gestellt werden."
        },
        {
          no: "3.2",
          text: "Die finale Auslieferung an den Kunden wird, sofern nicht anders vereinbart, von NIMMERSATT administrativ betreut."
        },
        {
          no: "3.3",
          text: "Mit der Übergabe von Festplatten oder physischem Produktionsmaterial geht die Obhutspflicht auf NIMMERSATT über."
        },
        {
          no: "3.4",
          text: "NIMMERSATT haftet für Datenverlust oder Schäden an Speichermedien durch nachweisliches Verschulden nur bei grober Fahrlässigkeit oder Vorsatz. Dem Artist wird die Erstellung redundanter Backups vor jeder Datenübergabe zwingend vorgeschrieben."
        }
      ]
    },

    /* --- § 4 ------------------------------------------------------------- */
    {
      id: "p4",
      no: "4",
      title: {
        de: "Projektvermittlung und Provision",
        en: "Project mediation and commission"
      },
      key: {
        de: [
          "20 % Provision vom Netto-Honorar",
          "Auszahlung: 30 Tage nach Zahlungseingang",
          "Rabatte über 10 % werden dir vorab mitgeteilt"
        ],
        en: [
          "20 % commission on the net fee",
          "Payout: 30 days after money arrives",
          "Discounts over 10 % are disclosed in advance"
        ]
      },
      summary: {
        de: "Die Geldseite der Vermittlung: NIMMERSATT darf Projekte in deinem Namen und auf deine Rechnung verhandeln und abschließen und erhält dafür 20 % des Netto-Honorars als Management-Provision. Rabatte von mehr als 10 % auf deinen festgelegten Tagessatz werden dir vorab mitgeteilt. Ausgezahlt wird innerhalb von 30 Kalendertagen, nachdem der Endkunde vollständig auf dem NIMMERSATT-Konto bezahlt hat — die Frist läuft also ab Zahlungseingang, nicht ab Rechnungsstellung.",
        en: "The money side of brokering: NIMMERSATT may negotiate and close projects in your name and for your account, and receives 20 % of the net fee as management commission. Discounts of more than 10 % off your agreed day rate are disclosed to you in advance. Payout happens within 30 calendar days after the end client has paid in full into NIMMERSATT's account — so the clock starts when the money arrives, not when the invoice goes out."
      },
      clauses: [
        {
          no: "4.1",
          text: "NIMMERSATT ist berechtigt, Projekte im Namen und auf Rechnung des Artists zu verhandeln und abzuschließen."
        },
        {
          no: "4.2",
          text: "Für vermittelte Dienstleistungen erhält NIMMERSATT 20% des Netto-Honorars als Management-Provision."
        },
        {
          no: "4.3",
          text: "Rabatte von mehr als 10% auf den festgelegten Tagessatz werden dem Artist vorab mitgeteilt."
        },
        {
          no: "4.4",
          text: "Die Auszahlung erfolgt innerhalb von 30 Kalendertagen nach vollständigem Zahlungseingang durch den Endkunden auf dem Konto von NIMMERSATT."
        }
      ]
    },

    /* --- § 5 ------------------------------------------------------------- */
    {
      id: "p5",
      no: "5",
      title: {
        de: "Lizenzierung von Archivmaterial / Stock Footage",
        en: "Licensing of archive material / stock footage"
      },
      key: {
        de: [
          "Nur freigegebenes, ungenutztes Material",
          "Immer mit schriftlicher Vereinbarung",
          "Wird separat als Lizenzgebühr honoriert"
        ],
        en: [
          "Only released, unused material",
          "Always via written agreement",
          "Paid separately as a licence fee"
        ]
      },
      summary: {
        de: "NIMMERSATT darf ungenutztes Material von dir — B-Roll, Stock Footage — an Dritte weiterlizenzieren, aber nur wenn du es freigegeben hast. Jede Lizenzierung braucht eine schriftliche Vereinbarung mit dir und wird im Einzelfall separat als Lizenzgebühr vergütet. Es entsteht also kein pauschaler Zugriff auf dein Archiv.",
        en: "NIMMERSATT may license unused material of yours — B-roll, stock footage — to third parties, but only material you have released. Every licensing case requires a written agreement with you and is remunerated separately as a licence fee on a case-by-case basis. So there is no blanket access to your archive."
      },
      clauses: [
        {
          no: "5.1",
          text: "NIMMERSATT ist berechtigt, vom Artist freigegebenes, ungenutztes Material (B-Roll, Stock Footage) an Dritte zu lizenzieren. Dies bedarf eine schriftliche Vereinbarung mit Artist und wird nach Einzelfall im Sinne einer Lizenzgebühr separat honoriert."
        }
      ]
    },

    /* --- § 6 ------------------------------------------------------------- */
    {
      id: "p6",
      no: "6",
      title: {
        de: "Preisgestaltung und Tagessätze",
        en: "Pricing and day rates"
      },
      key: {
        de: [
          "Tagessätze werden gemeinsam festgelegt",
          "Preisanpassungen nur mit deiner Zustimmung",
          "Basis-Tagessatz ist gegen Senkung geschützt"
        ],
        en: [
          "Day rates are set jointly",
          "Price changes need your consent",
          "Your base day rate is protected from cuts"
        ]
      },
      summary: {
        de: "Deine Preise bleiben deine Entscheidung. Tagessätze, Projektbudgets und Lizenzgebühren werden gemeinsam festgelegt und dokumentiert. Temporäre Preisanpassungen im Rahmen von Pitches oder Budgetverhandlungen brauchen vorher deine Zustimmung, und ohne diese darf NIMMERSATT deine festgelegten Basis-Tagessätze weder dauerhaft senken noch erhöhen. Das ist der Schutz gegen Preisdumping nach unten — und gegen Überteuerung nach oben, ohne dass du davon weißt.",
        en: "Your pricing stays your decision. Day rates, project budgets and licence fees are set and documented jointly. Temporary price adjustments during pitches or budget negotiations require your prior consent, and without it NIMMERSATT may neither permanently lower nor raise your agreed base day rates. That is the safeguard against being undercut — and against being priced up without your knowledge."
      },
      clauses: [
        {
          no: "6.1",
          text: "Tagessätze, Projektbudgets und Lizenzgebühren werden gemeinsam festgelegt und dokumentiert."
        },
        {
          no: "6.2",
          text: "Temporäre Preisanpassungen im Rahmen von Pitches oder Budgetverhandlungen bedürfen der vorherigen Zustimmung des Artists."
        },
        {
          no: "6.3",
          text: "Ohne Zustimmung des Artists darf NIMMERSATT die festgelegten Basis-Tagessätze weder dauerhaft senken noch erhöhen."
        }
      ]
    },

    /* --- § 7 ------------------------------------------------------------- */
    {
      id: "p7",
      no: "7",
      title: {
        de: "Pitches und Kundenpräsentationen",
        en: "Pitches and client presentations"
      },
      key: {
        de: [
          "Du entscheidest über kostenfreie Pitches",
          "Keine Anwesenheitspflicht bei Präsentationen"
        ],
        en: [
          "You decide about unpaid pitches",
          "No obligation to attend presentations"
        ]
      },
      summary: {
        de: "Pitches sind freiwillig: Du wählst selbst, ob du an kostenfreien oder nur an budgetierten Pitches teilnimmst. NIMMERSATT informiert dich rechtzeitig über geplante Termine, Teilnahme und Aufwand werden pro Pitch einzeln vereinbart. Persönlich anwesend sein musst du bei Präsentationen nicht, sofern das nicht gesondert vereinbart wurde.",
        en: "Pitching is voluntary: you choose whether you take part in unpaid pitches or only in budgeted ones. NIMMERSATT informs you of planned dates in good time, and participation and effort are agreed individually per pitch. You are not required to attend presentations in person unless separately agreed."
      },
      clauses: [
        { no: "7.1", text: "Der Artist wählt aus, ob er an kostenfreien oder budgetierten Pitches teilnehmen möchte." },
        { no: "7.2", text: "NIMMERSATT informiert den Artist rechtzeitig über geplante Pitch-Termine." },
        { no: "7.3", text: "Konkrete Teilnahme und Aufwand werden für jeden Pitch individuell vereinbart." },
        { no: "7.4", text: "Eine Pflicht zur persönlichen Anwesenheit bei Präsentationen besteht nicht, sofern nicht gesondert vereinbart." }
      ]
    },

    /* --- § 8 ------------------------------------------------------------- */
    {
      id: "p8",
      no: "8",
      title: {
        de: "Marketing, Werbung und Bildrechte",
        en: "Marketing, advertising and image rights"
      },
      key: {
        de: [
          "Einfaches Nutzungsrecht an Ausschnitten deiner Werke",
          "Nur für NIMMERSATT-Eigenwerbung",
          "Dein Name wird immer genannt"
        ],
        en: [
          "Simple usage right to excerpts of your work",
          "Only for NIMMERSATT's own promotion",
          "Your name is always credited"
        ]
      },
      summary: {
        de: "Du räumst NIMMERSATT ein einfaches — also nicht-exklusives — Nutzungsrecht an Ausschnitten deiner produzierten Werke ein, begrenzt auf Werbung, Social Media, Showreels und Pressearbeit von NIMMERSATT. Im Gegenzug wird bei jeder öffentlichen Verwendung dein Name in angemessener Form genannt. Das Recht ist auf Ausschnitte und auf Eigenwerbung des Netzwerks beschränkt; es ist keine Übertragung von Rechten an Dritte.",
        en: "You grant NIMMERSATT a simple — that is, non-exclusive — usage right to excerpts of the works you produce, limited to NIMMERSATT's advertising, social media, showreels and press work. In return, your name is credited appropriately in every public use. The right covers excerpts and the network's own promotion only; it is not a transfer of rights to third parties."
      },
      clauses: [
        { no: "8.1", text: "NIMMERSATT führt im Rahmen seiner Möglichkeiten Werbemaßnahmen für das Management-Netzwerk durch." },
        { no: "8.2", text: "Der Artist räumt NIMMERSATT ein einfaches Nutzungsrecht an Ausschnitten seiner produzierten Werke ein – für Werbung, Social Media, Showreels und Pressearbeit von NIMMERSATT." },
        { no: "8.3", text: "Bei jeder öffentlichen Verwendung wird der Name des Artists in angemessener Form genannt." }
      ]
    },

    /* --- § 9 ------------------------------------------------------------- */
    {
      id: "p9",
      no: "9",
      title: {
        de: "Stil, Qualität und Werkauswahl",
        en: "Style, quality and selection of works"
      },
      key: {
        de: [
          "Professionelle Standards und eigene Urheberschaft",
          "NIMMERSATT darf rechtlich heikle Projekte ablehnen"
        ],
        en: [
          "Professional standards and your own authorship",
          "NIMMERSATT may decline legally risky projects"
        ]
      },
      summary: {
        de: "Du garantierst, dass deine abgelieferten Produktionen branchenüblichen, professionellen Standards entsprechen und aus deiner eigenen Urheberschaft stammen. Umgekehrt darf NIMMERSATT die Vermittlung von Projekten ablehnen, die rechtliche Bedenken aufwerfen.",
        en: "You warrant that the productions you deliver meet standard professional industry quality and originate from your own authorship. Conversely, NIMMERSATT may refuse to broker projects that raise legal concerns."
      },
      clauses: [
        { no: "9.1", text: "Der Artist garantiert, dass alle abgelieferten Videoproduktionen branchenüblichen, professionellen Standards entsprechen und seiner eigenen Urheberschaft entstammen." },
        { no: "9.2", text: "NIMMERSATT behält sich vor, die Vermittlung für Projekte abzulehnen, die rechtliche Bedenken aufwerfen." }
      ]
    },

    /* --- § 10 ------------------------------------------------------------ */
    {
      id: "p10",
      no: "10",
      title: {
        de: "Urheberrecht und Nutzungsrechte",
        en: "Copyright and usage rights"
      },
      flag: true,
      key: {
        de: [
          "Dein Urheberrecht bleibt vollständig bei dir",
          "Portfolio-Nutzung erlaubt — aber vorher abstimmen",
          "Achtung: als Subunternehmer gibst du exklusive, unbegrenzte Nutzungsrechte ab",
          "Du stellst NIMMERSATT von Drittansprüchen frei"
        ],
        en: [
          "Your copyright stays fully with you",
          "Portfolio use allowed — but clear it first",
          "Note: as a subcontractor you grant exclusive, unlimited usage rights",
          "You indemnify NIMMERSATT against third-party claims"
        ]
      },
      summary: {
        de: "Der wichtigste Paragraf für deine Rechte — und der mit dem größten Unterschied zwischen den beiden Fällen. Grundsatz: Sämtliche Urheberrechte an deinen Werken bleiben bei dir, dauerhaft übertragen wird nichts. Bei Projekten über das Netzwerk erhält NIMMERSATT nur die Rechte, die nötig sind, um Endkunden die projektspezifischen Nutzungsrechte einzuräumen. Deine Arbeiten darfst du im eigenen Portfolio zeigen, musst die Nutzung aber vorher mit NIMMERSATT abstimmen und genehmigen lassen (wegen Sperrfristen und Exklusivität der Kunden) — die Genehmigung darf nicht unbillig verweigert werden. Anders liegt der Fall, wenn NIMMERSATT selbst Hauptdienstleister ist und dich als Subunternehmer einsetzt: Dann räumst du ausschließliche, übertragbare, zeitlich, räumlich und inhaltlich unbegrenzte Nutzungsrechte ein, inklusive unbekannter Nutzungsarten nach § 31a UrhG gegen angemessene Vergütung. In beiden Fällen stellst du NIMMERSATT von Ansprüchen Dritter frei, etwa bei Fremdmusik oder ungeklärten Persönlichkeitsrechten.",
        en: "The most important section for your rights — and the one where the two scenarios differ most. The principle: all copyright in your works stays with you, nothing is transferred permanently. For projects generated through the network, NIMMERSATT only receives the rights needed to grant end clients their project-specific usage rights. You may show the work in your own portfolio, but you must clear and get approval for that use with NIMMERSATT beforehand (because of embargoes and client exclusivity) — approval may not be unreasonably withheld. It is different when NIMMERSATT is itself the main service provider and engages you as a subcontractor: then you grant exclusive, transferable, and temporally, geographically and substantively unlimited usage rights, including unknown types of use under § 31a UrhG against appropriate remuneration. In both cases you indemnify NIMMERSATT against third-party claims, for example over licensed music or uncleared personality rights."
      },
      clauses: [
        { no: "10.1", text: "Der Artist behält sämtliche Urheberrechte an seinen Werken. Es werden keine geistigen Eigentumsrechte dauerhaft auf NIMMERSATT übertragen." },
        { no: "10.2", text: "Bei Anfragen und Projekten, die über das Netzwerk von NIMMERSATT generiert werden, profiliert sich NIMMERSATT als Artist-Management. NIMMERSATT erhält die zur Vertragserfüllung notwendigen Rechte, um Endkunden die projektspezifischen Nutzungsrechte einzuräumen." },
        { no: "10.3", text: "Portfolio-Nutzung: Der Artist hat ein Anrecht darauf, die im Rahmen der Zusammenarbeit erstellten Arbeiten (Videos, Stills, Director’s Cuts) im eigenen Portfolio zu Zwecken der Eigenwerbung unter Erwähnung von NIMMERSATT zu nutzen" },
        { no: "10.4", text: "Die geplante Portfolio-Nutzung ist vorab zwingend mit NIMMERSATT mündlich oder schriftlich abzustimmen und genehmigen zu lassen, um Sperrfristen (Embargos) oder Exklusivitätsansprüche der Endkunden nicht zu verletzen. Die Genehmigung darf von NIMMERSATT nicht unbillig verweigert werden." },
        { no: "10.5", text: "Der Artist stellt NIMMERSATT von Ansprüchen Dritter (z.B. verwendete Fremdmusik oder nicht geklärte Persönlichkeitsrechte im unaufgeforderten Eigen-Material) frei." },
        { no: "10.6", text: "Für den Fall, dass NIMMERSATT direkt von Agenturen oder Endkunden als Haupt-Dienstleister beauftragt wird und den Artist als Subunternehmer einsetzt, räumt der Artist NIMMERSATT ausschließliche, übertragbare, zeitlich, räumlich und inhaltlich unbegrenzte Nutzungsrechte (inklusive unbekannter Nutzungsarten gem. § 31a UrhG mit angemessener Vergütung) an den vertragsgegenständlichen Leistungen ein. Dies erfolgt zu dem Zweck, diese Rechte an die jeweiligen Agenturen oder Kunden weiterzugeben. Der Artist stellt NIMMERSATT hierbei vollumfänglich von sämtlichen Drittansprüchen (insb. bezüglich Musik- und Persönlichkeitsrechten) frei. Sofern der Endkunden-Vertrag eine Offenlegung von Subunternehmern verlangt oder Weiterbeauftragung ausschließt, ist dies vorrangig zu beachten." }
      ]
    },

    /* --- § 11 ------------------------------------------------------------ */
    {
      id: "p11",
      no: "11",
      title: {
        de: "Credits und Namensnennung",
        en: "Credits and naming"
      },
      key: {
        de: [
          "Anspruch auf branchenübliche Credits",
          "Du darfst Name und Logo von NIMMERSATT führen"
        ],
        en: [
          "Right to standard industry credits",
          "You may use NIMMERSATT's name and logo"
        ]
      },
      summary: {
        de: "Du hast Anspruch darauf, bei Werken, die du maßgeblich gestaltet hast, branchenüblich im Abspann oder in Begleittexten genannt zu werden — soweit das im jeweiligen Kundenprojekt umsetzbar ist. Umgekehrt darfst du Name und Logo von NIMMERSATT nutzen, um deine Repräsentanz kenntlich zu machen, allerdings unverändert und nicht sinnentfremdet.",
        en: "You are entitled to be credited in the usual industry manner — in the end credits or accompanying texts — for works you substantially shaped, as far as this is feasible in the respective client project. Conversely, you may use NIMMERSATT's name and logo to indicate your representation, but unaltered and not out of context."
      },
      clauses: [
        { no: "11.1", text: "Der Artist hat den Anspruch, bei den von ihm maßgeblich gestalteten Werken branchenüblich im Abspann (Credits) oder in Begleittexten genannt zu werden, sofern dies im jeweiligen Kundenprojekt umsetzbar ist." },
        { no: "11.2", text: "Der Name und das Logo von NIMMERSATT dürfen vom Artist zur Kenntlichmachung seiner Repräsentanz genutzt werden, dürfen jedoch nicht verändert oder sinnentfremdet werden." }
      ]
    },

    /* --- § 12 ------------------------------------------------------------ */
    {
      id: "p12",
      no: "12",
      title: {
        de: "Laufzeit, Kündigung, Versicherung und Leistungsverzug",
        en: "Term, termination, insurance and default"
      },
      flag: true,
      key: {
        de: [
          "3 Monate Probezeit, 2 Wochen Kündigungsfrist",
          "Danach: 1 Monat zum Monatsende",
          "Achtung: Haftung bei Leistungsverzug (Wasserfall-Prinzip)",
          "Versicherungsnachweis innerhalb von 4 Wochen"
        ],
        en: [
          "3-month trial period, 2 weeks' notice",
          "After that: 1 month to month's end",
          "Note: liability for default (waterfall principle)",
          "Proof of insurance within 4 weeks"
        ]
      },
      summary: {
        de: "Der Vertrag läuft unbefristet ab Zustimmung, mit drei Monaten Probezeit. In der Probezeit können beide Seiten mit zwei Wochen Frist kündigen, danach mit einem Monat zum Monatsende; außerordentliche Kündigung bleibt immer möglich. Offene Zahlungen und laufende Projekte werden trotz Kündigung normal zu Ende gebracht. Der finanziell heikelste Teil ist die Haftung: Wenn du zu spät oder mangelhaft lieferst und NIMMERSATT dadurch Geld verliert (Rechnungsabzüge, Stornierungen, Vertragsstrafen), haftest du für diesen Ausfall nach einem Wasserfall-Prinzip — zuerst werden unbeteiligte dritte Artists und externe Fremdkosten voll bezahlt, dann verwirkst du dein eigenes Honorar, und reicht das nicht, haftest du begrenzt auf die Deckungssumme deiner Berufshaftpflicht zuzüglich deines Projekthonorars. Mit Privatvermögen haftest du nur bei Vorsatz, grober Fahrlässigkeit oder wenn die Versicherung nicht zahlt. Deshalb musst du innerhalb von vier Wochen, nachdem dir ein konkretes Versicherungsangebot vorliegt, eine Berufshaftpflicht, eine vergleichbare bestehende Versicherung nachweisen — oder persönlich haften.",
        en: "The agreement runs indefinitely from acceptance, with a three-month trial period. During the trial either side can terminate with two weeks' notice, afterwards with one month to the end of the month; extraordinary termination always remains possible. Open payments and running projects are completed normally despite termination. The financially sharpest part is liability: if you deliver late or defectively and NIMMERSATT loses money as a result (invoice deductions, cancellations, contractual penalties), you are liable for that shortfall under a waterfall principle — uninvolved third-party artists and external costs are paid in full first, then you forfeit your own fee, and if that is not enough you are liable up to the coverage amount of your professional liability insurance plus your project fee. You are liable with private assets only in cases of intent, gross negligence, or if the insurance does not pay out. That is why, within four weeks of receiving a concrete insurance offer, you must provide proof of professional liability cover or an equivalent existing policy — or accept personal liability."
      },
      clauses: [
        { no: "12.1", text: "Die Vereinbarung tritt mit Zustimmung in Kraft und gilt auf unbestimmte Zeit." },
        { no: "12.2", text: "Es wird eine Probezeit von drei Monaten vereinbart. Während der Probezeit kann der Vertrag von beiden Seiten mit einer Frist von zwei Wochen gekündigt werden. Nach Ablauf der Probezeit kann die Vereinbarung mit einer Kündigungsfrist von einem Monat zum Monatsende gekündigt werden." },
        { no: "12.3", text: "Das Recht zur außerordentlichen Kündigung bleibt unberührt." },
        { no: "12.4", text: "Alle offenen Zahlungen und Projektabwicklungen sind trotz Kündigung vertragsgemäß zu beenden und zu begleichen, auch wenn diese über die Kündigungsfrist hinausgehen." },
        {
          no: "12.5",
          text: "Führt der Leistungsverzug oder die Schlechtleistung eines Artists zu finanziellen Einbußen bei NIMMERSATT (z.B. durch Rechnungsabzüge, Stornierungen oder Vertragsstrafen seitens des Endkunden), haftet der verursachende Artist für diesen Ausfall. Für die Auszahlung der verbleibenden Projektgelder gilt in diesem Fall das Priorisierungs-Prinzip (Wasserfall):",
          ordered: [
            "Zunächst werden alle vertragsgemäß erbrachten Leistungen unbeteiligter dritter Artists (z.B. Kamera, Licht, Colorist), die am selben Projekt beteiligt waren, sowie externe Fremdkosten vollumfänglich und priorisiert ausgezahlt.",
            "Zur Deckung des durch den Endkunden einbehaltenen Betrags verwirkt der verursachende Artist im ersten Schritt seinen eigenen Honoraranspruch (teilweise oder vollständig).",
            "Übersteigt der entstandene finanzielle Schaden (inklusive der Gagen der unbeteiligten Artists und der Management-Fee von NIMMERSATT) das Honorar des Verursachers, haftet der Artist begrenzt auf die Deckungssumme seiner Berufshaftpflicht zzgl. seines Projekthonorars. Eine darüber hinausgehende Haftung mit Privatvermögen besteht nur bei Vorsatz oder grober Fahrlässigkeit oder wenn die Versicherung nicht leistet. Eine nach §12.7 nachgewiesene Versicherung ist hierfür vorrangig heranzuziehen."
          ]
        },
        { no: "12.6", text: "Der Artist verpflichtet sich zur termingerechten und mängelfreien Lieferung seiner vertraglich vereinbarten Leistung (z.B. Rohschnitt, Final Edit, Grading). Liefert der Artist nicht, nicht rechtzeitig (z.B. Verpassen einer fixen Kunden-Deadline) oder in einer qualitativ unzureichenden Form, die eine Abnahme durch den Kunden unmöglich macht, gerät der Artist in Leistungsverzug. NIMMERSATT ist in diesem Fall berechtigt, nach Ablauf einer angemessenen Nachfrist (sofern das Projekt-Timing dies zulässt) vom Einzelauftrag zurückzutreten und Ersatz für den entstandenen Schaden zu verlangen." },
        {
          no: "12.7",
          text: "Der Artist weist NIMMERSATT innerhalb von vier Wochen, nachdem ihm ein konkretes Versicherungsangebot über den Versicherungspartner von NIMMERSATT oder ein vergleichbares eigenes Angebot vorliegt, eine der folgenden Absicherungen nach:",
          lettered: [
            "a) eine Berufshaftpflichtversicherung, die Schäden durch Leistungsverzug und Schlechtleistung abdeckt, oder",
            "b) eine bereits bestehende Versicherung mit vergleichbarem Deckungsumfang",
            "c) für Schäden durch Leistungsverzug und Schlechtleistung persönlich haftet."
          ]
        }
      ]
    },

    /* --- § 13 ------------------------------------------------------------ */
    {
      id: "p13",
      no: "13",
      title: {
        de: "Änderungen dieser Bedingungen",
        en: "Changes to these terms"
      },
      key: {
        de: [
          "Änderungen 30 Tage vorher angekündigt",
          "Nur wirksam mit deiner ausdrücklichen Zustimmung",
          "Schweigen gilt nicht als Zustimmung"
        ],
        en: [
          "Changes announced 30 days in advance",
          "Only effective with your explicit consent",
          "Silence does not count as consent"
        ]
      },
      summary: {
        de: "NIMMERSATT darf die Bedingungen anpassen, muss dich aber spätestens 30 Tage vor Inkrafttreten in Textform informieren — inklusive einer Gegenüberstellung der alten und neuen Regelungen. Entscheidend: Änderungen treten nur in Kraft, wenn du ausdrücklich zustimmst. Zustimmung durch Schweigen ist ausdrücklich ausgeschlossen.",
        en: "NIMMERSATT may adjust the terms, but must inform you in text form at least 30 days before they take effect — including a side-by-side comparison of the old and new provisions. Crucially: changes only take effect if you explicitly agree. Consent by silence is expressly excluded."
      },
      clauses: [
        { no: "13.1", text: "NIMMERSATT behält sich vor, diese Bedingungen anzupassen. Änderungen werden in Textform mitgeteilt, spätestens 30 Tage vor Inkrafttreten." },
        { no: "13.2", text: "Die Mitteilung enthält eine Gegenüberstellung der bisherigen und neuen Regelungen." },
        { no: "13.3", text: "Änderungen treten nur in Kraft, wenn der Artist ausdrücklich zugestimmt hat. Zustimmung durch Schweigen ist ausgeschlossen." }
      ]
    },

    /* --- § 14 ------------------------------------------------------------ */
    {
      id: "p14",
      no: "14",
      title: {
        de: "Haftung und Regress",
        en: "Liability and recourse"
      },
      key: {
        de: [
          "NIMMERSATT haftet unbeschränkt bei Vorsatz/grober Fahrlässigkeit",
          "Kein Ersatz für entgangenen Gewinn oder höhere Gewalt",
          "Regressanspruch gegen dich bei deinen Pflichtverletzungen"
        ],
        en: [
          "NIMMERSATT fully liable for intent/gross negligence",
          "No cover for lost profit or force majeure",
          "Right of recourse against you for your breaches"
        ]
      },
      summary: {
        de: "Die Haftung von NIMMERSATT ist gestaffelt: unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei leichter Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten, darüber hinaus ausgeschlossen — insbesondere für entgangenen Gewinn und Schäden durch höhere Gewalt. Die andere Richtung: Haftet NIMMERSATT als Hauptunternehmer gegenüber Agenturen oder Kunden für deine Fehler oder Pflichtverletzungen (§ 278 BGB), besteht im Innenverhältnis ein uneingeschränkter Regressanspruch gegen dich, und du stellst NIMMERSATT von diesen Ansprüchen frei — allerdings nur, soweit du die Pflichtverletzung zu vertreten hast.",
        en: "NIMMERSATT's liability is tiered: unlimited for intent and gross negligence, for slight negligence only where essential contractual duties are breached, and otherwise excluded — in particular for lost profit and force majeure. The other direction: where NIMMERSATT is liable as main contractor towards agencies or clients for your errors or breaches (§ 278 BGB), it has an unrestricted right of recourse against you internally, and you indemnify NIMMERSATT against those claims — but only to the extent you are responsible for the breach."
      },
      clauses: [
        { no: "14.1", text: "NIMMERSATT haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit." },
        { no: "14.2", text: "Bei leichter Fahrlässigkeit haftet NIMMERSATT nur bei Verletzung wesentlicher Vertragspflichten." },
        { no: "14.3", text: "Eine weitergehende Haftung ist ausgeschlossen, insbesondere für entgangenen Gewinn oder Schäden durch höhere Gewalt." },
        { no: "14.4", text: "Soweit NIMMERSATT als Hauptunternehmer gegenüber Agenturen oder Kunden für Fehler, Versäumnisse oder Pflichtverletzungen des Artists haftet (§ 278 BGB), steht NIMMERSATT ein uneingeschränkter Regressanspruch gegenüber dem verursachenden Artist im Innenverhältnis zu. Der Artist stellt NIMMERSATT insoweit von allen Ansprüchen des Endkunden oder der Agentur vollumfänglich frei, sofern er die Pflichtverletzung zu vertreten hat." }
      ]
    },

    /* --- § 15 ------------------------------------------------------------ */
    {
      id: "p15",
      no: "15",
      title: {
        de: "Datenschutz",
        en: "Data protection"
      },
      key: {
        de: [
          "Daten nur zur Vertragserfüllung",
          "Weitergabe nur an Buchhaltung/Dispo o. gesetzlich",
          "Auskunft, Berichtigung, Löschung, Einschränkung"
        ],
        en: [
          "Data only for performing the contract",
          "Shared only with accounting/scheduling or by law",
          "Access, rectification, erasure, restriction"
        ]
      },
      summary: {
        de: "Standard-DSGVO-Klausel: Deine personenbezogenen Daten werden ausschließlich zur Vertragserfüllung und für gesetzliche Pflichten verarbeitet (Art. 6 Abs. 1 lit. b und c DSGVO). An externe Dritte gehen sie nur, soweit das zur Vertragserfüllung nötig ist — etwa Buchhaltung oder Disposition — oder gesetzlich vorgeschrieben. Dir stehen die üblichen Rechte auf Auskunft, Berichtigung, Löschung und Einschränkung zu.",
        en: "Standard GDPR clause: your personal data is processed exclusively to perform the contract and to meet legal obligations (Art. 6(1)(b) and (c) GDPR). It is passed to external third parties only where necessary to perform the contract — such as accounting or scheduling — or where legally required. You have the usual rights to access, rectification, erasure and restriction."
      },
      clauses: [
        { no: "15.1", text: "NIMMERSATT verarbeitet personenbezogene Daten ausschließlich zur Vertragserfüllung und gesetzlichen Pflichten (Art. 6 Abs. 1 lit. b und c DSGVO)." },
        { no: "15.2", text: "Weitergabe an NIMMERSATT externer Dritte erfolgt nur zur Vertragserfüllung (z.B. Buchhaltung, Dispo) oder soweit gesetzlich vorgeschrieben." },
        { no: "15.3", text: "Der Artist hat das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung." }
      ]
    },

    /* --- § 16 ------------------------------------------------------------ */
    {
      id: "p16",
      no: "16",
      title: {
        de: "Schlussbestimmungen und Anlagen",
        en: "Final provisions and attachments"
      },
      key: {
        de: [
          "Deutsches Recht, Gerichtsstand Berlin",
          "Änderungen brauchen Schriftform",
          "Ersetzt alle früheren Absprachen"
        ],
        en: [
          "German law, jurisdiction Berlin",
          "Changes require written form",
          "Supersedes all earlier agreements"
        ]
      },
      summary: {
        de: "Die üblichen Schlussklauseln: Es gilt deutsches Recht, Gerichtsstand ist Berlin, Änderungen bedürfen der Schriftform. Sollte eine einzelne Bestimmung unwirksam sein, bleibt der Rest des Vertrags wirksam (Salvatorische Klausel). Und: Diese Vereinbarung ersetzt alle vorherigen mündlichen und schriftlichen Absprachen zum selben Gegenstand — was früher besprochen wurde, gilt also nur noch, wenn es hier drinsteht.",
        en: "The usual closing clauses: German law applies, the place of jurisdiction is Berlin, and changes require written form. If an individual provision is invalid, the rest of the agreement remains effective (severability clause). And: this agreement supersedes all previous verbal and written arrangements on the same subject — so anything discussed earlier only counts if it appears in here."
      },
      clauses: [
        { no: "16.1", text: "Es gilt deutsches Recht." },
        { no: "16.2", text: "Gerichtsstand ist Berlin." },
        { no: "16.3", text: "Änderungen bedürfen der Schriftform." },
        { no: "16.4", text: "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Vereinbarung im Übrigen wirksam." },
        { no: "16.5", text: "Diese Vereinbarung ersetzt alle vorherigen mündlichen sowie schriftlichen Absprachen zum selben Gegenstand." }
      ]
    },

    /* --- § 17 ------------------------------------------------------------ */
    {
      id: "p17",
      no: "17",
      title: {
        de: "Strategische Partnerschaft & Business Development",
        en: "Strategic partnership & business development"
      },
      key: {
        de: [
          "Dealpaket und Marktwert werden gemeinsam definiert",
          "Coaching bei Eigenakquise — auf Wunsch",
          "Bei NIMMERSATT-Branding gilt die Corporate Identity"
        ],
        en: [
          "Deal package and market value defined together",
          "Coaching for your own acquisition — on request",
          "Under NIMMERSATT branding, the CI applies"
        ]
      },
      summary: {
        de: "Der partnerschaftliche Teil: NIMMERSATT will dich über die rein kreative Arbeit hinaus als aktiven Part in der Marktentwicklung positionieren. Dealpaket und Marktwert werden gemeinsam im Gespräch definiert, und auf Wunsch unterstützt dich NIMMERSATT nach Absprache mit Coaching und Material bei eigener Akquise. Die Gegenleistung: Wenn du unter dem Branding von NIMMERSATT akquirierst, wahrst du Corporate Identity und Qualitätsstandards der Marke.",
        en: "The partnership part: NIMMERSATT wants to position you as an active player in market development beyond purely creative work. The deal package and your market value are defined jointly in conversation, and on request NIMMERSATT supports you with coaching and material for your own acquisition. In return: when you acquire under NIMMERSATT branding, you uphold the brand's corporate identity and quality standards."
      },
      clauses: [
        { no: "17.1", text: "NIMMERSATT verfolgt das Ziel, den Artist über die rein kreative Tätigkeit hinaus als aktiven Part in der Marktentwicklung zu positionieren." },
        { no: "17.2", text: "NIMMERSATT und Küstler*in definieren im Gespräch ein Dealpaket sowie Marktwert." },
        { no: "17.3", text: "Sofern vom Artist gewünscht, unterstützt NIMMERSATT den Artist nach Absprache durch Coaching und Material bei der aktiven Akquise (Business Development)." },
        { no: "17.4", text: "Der Artist verpflichtet sich, bei Eigenakquise unter dem Branding von NIMMERSATT die Corporate Identity und die Qualitätsstandards der Marke zu wahren." }
      ]
    },

    /* --- § 18 ------------------------------------------------------------ */
    {
      id: "p18",
      no: "18",
      title: {
        de: "Außenkommunikation & Markenschutz („One-Voice-Policy“)",
        en: "External communication & brand protection (“one-voice policy”)"
      },
      key: {
        de: [
          "Projektkommunikation läuft über NIMMERSATT",
          "Keine eigenen Honorar- oder Terminzusagen",
          "Direktanfragen sofort weiterleiten"
        ],
        en: [
          "Project communication runs through NIMMERSATT",
          "No independent fee or scheduling commitments",
          "Forward direct enquiries immediately"
        ]
      },
      summary: {
        de: "Nach außen spricht eine Stimme: Die gesamte projektbezogene Kommunikation mit Kunden, Agenturen und Dritten liegt bei NIMMERSATT oder braucht ausdrückliche Rücksprache. Konkret heißt das, du führst keine eigenen Vertragsverhandlungen, machst keine Honorarabsprachen und gibst keine Terminzusagen gegenüber dem Kunden, solange dich die Geschäftsführung nicht ausdrücklich dazu ermächtigt hat. Anfragen, die direkt bei dir landen, leitest du unverzüglich weiter.",
        en: "One voice to the outside: all project-related communication with clients, agencies and third parties sits with NIMMERSATT or requires explicit prior consultation. In practice that means you conduct no negotiations of your own, make no fee arrangements and give no scheduling commitments to the client unless management has expressly authorised you. Enquiries that reach you directly must be forwarded without delay."
      },
      clauses: [
        { no: "18.1", text: "Die gesamte projektbezogene Außenkommunikation mit Kunden, Agenturen und Dritten liegt allein bei NIMMERSATT oder bedarf ausdrücklicher Rücksprache." },
        { no: "18.2", text: "Der Artist verpflichtet sich, keine eigenständigen Vertragsverhandlungen, Honorarabsprachen oder Terminzusagen gegenüber dem Kunden zu treffen, sofern der Artist nicht ausdrücklich durch die Geschäftsführung von NIMMERSATT ermächtigt wurde." },
        { no: "18.3", text: "Eingehende Anfragen des Kunden direkt an den Artist sind unverzüglich an NIMMERSATT weiterzuleiten, um eine konsistente Markenführung und professionelle Abwicklung zu gewährleisten." }
      ]
    },

    /* --- § 19 ------------------------------------------------------------ */
    {
      id: "p19",
      no: "19",
      title: {
        de: "Qualitätssicherung & Vetting bei Eigenakquise",
        en: "Quality assurance & vetting for own acquisition"
      },
      key: {
        de: [
          "Eigene Leads durchlaufen eine Qualitätsprüfung",
          "Kalkulation und Angebot macht NIMMERSATT",
          "Schutz vor Preisdumping im Netzwerk"
        ],
        en: [
          "Your own leads go through quality vetting",
          "NIMMERSATT does the costing and the quote",
          "Protects network pricing from undercutting"
        ]
      },
      summary: {
        de: "Bringst du selbst einen Lead oder ein Projekt ins Netzwerk, durchläuft es eine verpflichtende Qualitäts- und Strategieprüfung, und NIMMERSATT darf Projekte ablehnen, die nicht dem Qualitätsstandard der Marke entsprechen. Die finale Kalkulation und Angebotserstellung macht ausschließlich NIMMERSATT — das soll marktkonforme Preise sichern und verhindern, dass das Preisgefüge durch Unterbietung kaputtgeht. In Akquisegesprächen kommunizierst du NIMMERSATT als dein Management, sofern das Thema ist, und machst keine Zusagen, die operativ nicht abbildbar sind.",
        en: "If you bring a lead or project into the network yourself, it goes through mandatory quality and strategy vetting, and NIMMERSATT may reject projects that do not meet the brand's quality standard. Final costing and quoting is done exclusively by NIMMERSATT — intended to keep pricing in line with the market and stop the price structure being undercut. In acquisition conversations you communicate NIMMERSATT as your management where that is part of the discussion, and you make no commitments that cannot be delivered operationally."
      },
      clauses: [
        { no: "19.1", text: "Bringt der Artist eigenständig einen Lead oder ein Projekt in das Netzwerk ein, unterliegt dieses Projekt einer obligatorischen Qualitäts- und Strategieprüfung durch NIMMERSATT." },
        { no: "19.2", text: "NIMMERSATT behält sich das Recht vor, Projekte abzulehnen, die nicht dem definierten Qualitätsstandard der Marke entsprechen." },
        { no: "19.3", text: "Die finale Kalkulation und Angebotserstellung für Eigenakquise-Projekte erfolgt ausschließlich durch NIMMERSATT. Damit wird sichergestellt, dass die Preisgestaltung marktkonform bleibt und das Preisgefüge innerhalb der Agentur nicht durch Unterbietung (Dumping) gefährdet wird." },
        { no: "19.4", text: "Der Artist ist verpflichtet, bei Eigenakquise-Gesprächen die Identität von NIMMERSATT als sein Management zu kommunizieren, sofern NIMMERSATT und daraus entstandene Referenzen oder Identität Teil des Gesprächs Inhalts sind. Des weiteren sind keine Zusagen zu machen, die im Rahmen der operativen Kapazitäten nicht abzubilden sind oder dem Image des Netzwerks widersprechen, sofern im Vorhinein nicht anders kommuniziert." }
      ]
    },

    /* --- § 20 ------------------------------------------------------------ */
    {
      id: "p20",
      no: "20",
      title: {
        de: "Honorare & Akquisitions-Incentives",
        en: "Fees & acquisition incentives"
      },
      key: {
        de: [
          "20 % Management-Fee vom Netto-Projekthonorar",
          "Eigene Leads werden über ein Provisions-Modell honoriert",
          "Account Management optional gegen 20 %"
        ],
        en: [
          "20 % management fee on the net project fee",
          "Your own leads are rewarded via a commission model",
          "Account management optional at 20 %"
        ]
      },
      summary: {
        de: "Der Honorar-Split in Kurzform: NIMMERSATT erhält für Repräsentanz und Verwaltung eine Management-Fee von 20 % des Netto-Projekthonorars (Creative Fee). Bringst du selbst einen Auftrag oder Neukunden ins Netzwerk („Artist-Lead“), wird diese Akquiseleistung über ein Provisions-Modell honoriert. Zusätzlich kann NIMMERSATT bei deinen Eigenproduktionen Account Management und Projektleitung übernehmen, ebenfalls gegen 20 % des Netto-Honorars — behält sich aber vor, das projektbezogen zu entscheiden oder abzulehnen. Wie das Provisions-Modell in 20.2 konkret aussieht, steht nicht im Vertrag; das gehört ins Gespräch und ins Dealpaket.",
        en: "The fee split in short: NIMMERSATT receives a management fee of 20 % of the net project fee (creative fee) for representation and administration. If you bring in a job or a new client yourself (an \"artist lead\"), that acquisition work is rewarded through a commission model. In addition, NIMMERSATT can take on account management and project leadership for your own productions, likewise at 20 % of the net fee — but reserves the right to decide or decline per project. What the commission model in 20.2 actually looks like is not specified in the contract; that belongs in the conversation and the deal package."
      },
      clauses: [
        { no: "20.1", text: "Honorar-Split: NIMMERSATT erhält für die allgemeine Repräsentanz und Verwaltung eine Management-Fee von 20% des Netto-Projekthonorars (Creative Fee)." },
        { no: "20.2", text: "Inbound-Incentives (Artist als Akquisitor): Generiert der Artist eigenständig einen Projektauftrag oder einen Neukunden-Kontakt für das NIMMERSATT-Netzwerk („Artist-Lead“), wird diese Akquiseleistung durch ein Provisions-Modell honoriert." },
        { no: "20.3", text: "Account Management & Projektleitung: NIMMERSATT bietet die Möglichkeit bei Eigenproduktion von Artist kommunikative Dienstleistungen wie im Rahmen des Management-Vertrags gegen 20% des Netto-Honoras zu übernehmen. NIMMERSATT behält sich das Recht vor, projektbezogen zu entscheiden und ggf. abzulehnen." }
      ]
    }
  ]
};
