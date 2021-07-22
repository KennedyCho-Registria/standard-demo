// luxury goods demo
var aura = {
  isBrandLg: false,
  brandName: "Regina",
  logo: "../img/regina-logo.png", 
  logoAlt: "Regina",

  ownerFirstName: "Diane",
  ownerLastName: "Lucero",
  ownerEmail: "dlucero@registria.com",
  ownerPhone: "(720) 333-4444",
  ownerAddress: "1600 Stout St. #1600",
  ownerCity: "Denver",
  ownerState: "CO",
  ownerZip: "80202",

  finePrint: true,
  finePrintText: "Modern Luxury for Modern Humans",
  copyright: "Regina",
  regHeader: ,
  regSubheader: 'Register your product to receive a coupon code for 15% off at our online store.',
  essentialSubheader: 'Register your product to receive official REGINA promotions and digital communications.', 
  regDesc: 'If you are outside of the U.S.',
  regDescLinkText: 'please click here.',
  regProductName: 'Mirkin RH23', 
  regProductFamily: 'handbag',
  regProductModelFind: 'Look inside the bag at the product tag',
  regModelNumber: 'Handbag-12345',
  regSerialNumber: '2533830238303839',
  regImage: '../img/handbag01.jpg',
  regProductCategory: true,
  regModelFinder: true,
  regIsInstaller: true,
  regFormNameSize: "col-lg-6",
  regFormPhoneType: true,
  regPlaceOfPurchase: true,
  regRetailer: [
    {
      name:"Nordstrom"
    },
    {
      name: "Saks Fifth"
    },
    {
      name: "Bergdorf Goodman"
    },
    {
      name: "Neiman Marcus"
    },
    {
      name: "Other"
    }
  ],
  regPurchasePrice: true,
  regReceiveSmsCheckbox: false,
  regDataPolicyCheckbox: true,

  languages: [
    {
      language: "en-us",
      flag: "",
      abbr: "EN",
      name: "English",
      isSelected: true
    },
    {
      language: "",
      name: "Espanol",
      flag: "",
      abbr: "ES",
      isSelected: false
    },
    {
      language: "French-NA",
      flag: "",
      name: "Francais",
      abbr: "FR",
      isSelected: false
    }
  ],

  prodCategories: [
    {
      value: "Designer"
    },
    {
      value: "Luxury"
    },
    {
      value: "Handbag"
    },
  ],

  espHeader: 'Add a Genuine Regina Extended Service Plan',
	espSubheader: 'Act now for exclusive pricing and enjoy all of these benefits plus more when you purchase now.',
  espDesc: 'By purchasing this Protection Plan you agree to the Protection Plan Terms & Conditions. Your Protection Plan Terms & Conditions will be delivered via email within 24 hours of purchase.',

  espBenefits: [
    {
      icon: 'fa fa-band-aid',
      title: 'Protection',
      text: 'If your handbag experiences unexpected damages, we\'ll offer to repair it or replace it',
    },
    {
      icon: 'fa fa-sd-card',
      title: 'Maintenance',
      text: 'We offer regular material maintenance to help prevent future damages',
    },
    {
      icon: 'fa fa-umbrella',
      title: 'Wear & Tear',
      text: 'Damages from normal wear and tear are protected',
    },
    {
      icon: 'fa fa-bolt',
      title: 'Exchange Program',
      text: 'Trade-in opportunities are available based on product status',
    }
  ],

  espOptions: [
    {
      id: 'option1',
      isBold: true,
      title: '3 Year Protection Plan',
      hasValue: true,
      value: 'Less than $6.94/month',
      price: '$43.85',
      hasMsrp: false,
      msrp: '',
      isChecked: true,
    },
    {
      id: 'option2',
      isHighlight: false,
      title: '1 Year Protection Plan',
      hasValue: false,
      value: '',
      price: '$20.95',
      hasMsrp: false,
      msrp: '',
      isChecked: false,
    },
  ],

  merchHeader: 'Get the most out of your new Handbag.',
  merchSubheader: 'Enjoy exclusive savings on REGINA approved accessories when you buy now.',

  merchandiseOffers: [
    {
      id: "offer1",
      img: '../img/offer01.jpg',
      bestValue: '$10.00',
      title: 'Leather Care Kit',
      price: '$49.99',
      hasMsrp: true,
      msrp: '$59.99',
    },
    {
      id: 'offer2',
      img: '../img/offer02.jpg',
      bestValue: '$5.00',
      title: 'Purse Pillows',
      price: '$34.99',
      hasMsrp: true,
      msrp: '$39.99',
    },
    {
      id: 'offer3',
      img: '../img/offer03.jpg',
      bestValue: '$10.00',
      title: 'Leather Moisturizer',
      price: '$39.99',
      hasMsrp: true,
      msrp: '$49.99',
    },
  ],

  cartSubtotal: '$93.84',
  cartTax: '$5.00',
  cartTotal: '$98.84',

  espCartSubtotal: '$43.85',
  espCartTax: '$5.00',
  espCartTotal: '$48.85',

  itemCartSubtotal: '$49.99',
  itemCartTax: '$5.00',
  itemCartTotal: '$54.99',

  confirmationHeader: 'You\'re all set!',
  confirmationSubheader: 'You will receive a confirmation via email.',

  confirmationOffers: [
    {
      img: '../img/spa-logo.jpg',
      bestValue: '',
      title: 'The Handbag Spa',
      desc: 'Send your bag in for one deluxe treatment on us.',
      price: 'FREE',
      hasMsrp: false,
      msrp: '$149.99',
      buttonText: 'Schedule',
      buttonLink: 'confirmation.html',
    },
    {
      img: '../img/bg-logo.jpg',
      bestValue: '',
      title: '15% Off Coupon Code',
      desc: 'Use coupon code "Regina15" to get 15% off at Nordstrom.',
      price: '',
      hasMsrp: false,
      msrp: '$49.95',
      buttonText: 'Shop Now',
      buttonLink: 'confirmation.html',
    }
  ],
  essentialSuggestions: [
    {
      img: '/../img/speaker-logo.jpg',
      bestValue: '',
      title: 'The Speaker App',
      desc: 'Control your speaker from anywhere in the world.',
      price: 'FREE',
      hasMsrp: false,
      msrp: '$149.99',
      buttonText: 'Download Now',
      buttonLink: 'https://www.apple.com/app-store/',
    },
    {
      img: '/../img/spotify-logo.png',
      bestValue: '',
      title: 'Sign up today for Spotify!',
      desc: '',
      price: '3 free months',
      hasMsrp: false,
      msrp: '',
      buttonText: 'Sign up',
      buttonLink: 'https://www.spotify.com/us/',
    },
  ],

  surveyQuestion: 'Which other REGINA products are you considering purchasing in the next year?',
  surveyItem: [
    {
      label: 'Watch',
      name: 'checkbox1'
    },
    {
      label: 'Makeup',
      name: 'checkbox2'
    },
    {
      label: 'Sunglasses',
      name: 'checkbox3'
    },
    {
      label: 'Shoes',
      name: 'checkbox4'
    },
  ],

  registeredProducts: [

    {
      name: 'Mirkin RH23',
      model: 'Mirkin-12345',
      date: '01/01/2021',
      hasNewOffer: true,
    },
    {
      name: 'Mirkin DayWear Pumps',
      model: 'Mirkin-6789',
      date: '05/25/2020',
      hasNewOffer: false,
    },
  ],
};

console.log(aura);

rivets.bind(document.querySelector('#aura'), // bind to the element with id "candy-shop"
  {
    aura: aura // add the data object so we can reference it in our template
  }
);
