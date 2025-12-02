// Coğrafi Keşifler, Rönesans, Reform, Aydınlanma ve Sanayi İnkılabı Soruları

const historyQuestions = [
  {
    id: 1,
    category: "Coğrafi Keşifler",
    question: "Coğrafi Keşifler'in en önemli nedenlerinden biri nedir?",
    answers: ["Yeni ticaret yolları bulma isteği", "Bilimsel araştırma yapmak", "Savaşlardan kaçmak", "Yeni tarım alanları bulmak"],
    correct: 0
  },
  {
    id: 2,
    category: "Coğrafi Keşifler",
    question: "1492'de sürekli batıya giderek Hindistan'a ulaşacağını düşünürken Amerika kıtasına ulaşan kaşif kimdir?",
    answers: ["Macellan", "Amerigo Vespucci", "Kristof Kolomb", "Bartolomeu Dias"],
    correct: 2
  },
  {
    id: 3,
    category: "Coğrafi Keşifler",
    question: "Coğrafi Keşifler sonucunda hangi ticaret yolları önemini kaybetmiştir?",
    answers: ["Atlas Okyanusu Yolları", "İpek ve Baharat Yolları", "Kral Yolu", "Büyük Okyanus Yolları"],
    correct: 1
  },
  {
    id: 4,
    category: "Coğrafi Keşifler",
    question: "Coğrafi Keşifler sonucunda Hristiyanlığın yeni kıtalara yayılması faaliyetlerine ne denir?",
    answers: ["Sömürgecilik", "Misyonerlik", "Feodalizm", "Merkantilizm"],
    correct: 1
  },
  {
    id: 5,
    category: "Coğrafi Keşifler",
    question: "Coğrafi Keşifler'e öncülük eden (başlatan) iki Avrupa devleti hangileridir?",
    answers: ["İngiltere ve Fransa", "Almanya ve İtalya", "İspanya ve Portekiz", "Hollanda ve İsveç"],
    correct: 2
  },
  {
    id: 6,
    category: "Reform",
    question: "Reform hareketleri ilk olarak hangi ülkede başlamıştır?",
    answers: ["İtalya", "Fransa", "Almanya", "İngiltere"],
    correct: 2
  },
  {
    id: 7,
    category: "Reform",
    question: "Reform hareketlerinin Avrupa'da yayılmasını hızlandıran en önemli teknolojik gelişme nedir?",
    answers: ["Pusula", "Matbaa", "Buharlı makine", "Teleskop"],
    correct: 1
  },
  {
    id: 8,
    category: "Reform",
    question: "Reform hareketlerini başlatan Alman din adamı kimdir?",
    answers: ["Jan Kalven", "Kral VIII. Henry", "Leonardo da Vinci", "Martin Luther"],
    correct: 3
  },
  {
    id: 9,
    category: "Reform",
    question: "Reform'un başlamasının en önemli nedeni olan, kilisenin 'para karşılığı günah affetme' uygulamasına ne denir?",
    answers: ["Vaftiz", "Aforoz", "Endüljans", "Ayin"],
    correct: 2
  },
  {
    id: 10,
    category: "Reform",
    question: "Coğrafi Keşifler ve Rönesans'tan sonra başlayan Reform hareketleri, en çok hangi kurumun gücünü sarsmıştır?",
    answers: ["Kralların", "Bilim insanlarının", "Katolik Kilisesi'nin", "Ordunun"],
    correct: 2
  },
  {
    id: 11,
    category: "Rönesans",
    question: "Rönesans döneminin en ünlü eseri olan 'Mona Lisa' tablosunu yapan sanatçı kimdir?",
    answers: ["Michelangelo", "Donatello", "Raphael", "Leonardo da Vinci"],
    correct: 3
  },
  {
    id: 12,
    category: "Rönesans",
    question: "Aşağıdakilerden hangisi Rönesans döneminde daha çok önem kazanmıştır?",
    answers: ["Kilise ve din adamları", "Bilim, sanat ve akıl", "Tarım ve hayvancılık", "Askerlik ve savaşlar"],
    correct: 1
  },
  {
    id: 13,
    category: "Rönesans",
    question: "Rönesans döneminde hangi iki kültürün eserleri yeniden incelenmiş ve örnek alınmıştır?",
    answers: ["Mısır ve Mezopotamya", "Çin ve Hindistan", "Eski Yunan ve Roma", "Viking ve Pers"],
    correct: 2
  },
  {
    id: 14,
    category: "Rönesans",
    question: "Rönesans dönemi hangi çağın başlangıcı olarak kabul edilir?",
    answers: ["İlk Çağ", "Orta Çağ", "Yeni Çağ", "Yakın Çağ"],
    correct: 2
  },
  {
    id: 15,
    category: "Rönesans",
    question: "Rönesans döneminde ortaya çıkan ve 'insanı' evrenin merkezine koyan düşünce sisteminin adı nedir?",
    answers: ["Hümanizm", "Skolastik Düşünce", "Feodalizm", "Protestanlık"],
    correct: 0
  },
  {
    id: 16,
    category: "Aydınlanma Çağı",
    question: "Aydınlanma Çağı, hangi isimle de bilinmektedir?",
    answers: ["Akıl Çağı", "Karanlık Çağ", "Keşifler Çağı", "Bakır Çağı"],
    correct: 0
  },
  {
    id: 17,
    category: "Aydınlanma Çağı",
    question: "Aydınlanma Çağı'nda ortaya çıkan özgürlük, eşitlik ve adalet gibi fikirler, hangi önemli olayın başlamasına neden olmuştur?",
    answers: ["Coğrafi Keşifler", "Yüzyıl Savaşları", "Fransız İhtilali", "Haçlı Seferleri"],
    correct: 2
  },
  {
    id: 18,
    category: "Aydınlanma Çağı",
    question: "Aydınlanma Çağı'nda geliştirilen 'güçler ayrılığı' ilkesinin temel amacı nedir?",
    answers: ["Kilisenin otoritesini yeniden kurmak.", "Sadece aristokratların siyasi haklara sahip olmasını sağlamak.", "Sanayi üretimini hızlandırmak.", "Yönetimde tek bir gücün aşırı otoritesini engellemek."],
    correct: 3
  },
  {
    id: 19,
    category: "Aydınlanma Çağı",
    question: "Yer çekimi kanununu bulan ve 'Aydınlanma' dönemini bilimsel olarak başlatan kişi kimdir?",
    answers: ["Martin Luther", "Isaac Newton", "Leonardo da Vinci", "Jean-Jacques Rousseau"],
    correct: 1
  },
  {
    id: 20,
    category: "Aydınlanma Çağı",
    question: "Aydınlanma Çağı'ndaki fikirler hangi sosyal sınıf arasında daha hızlı yayılmıştır?",
    answers: ["Köylüler", "Rahipler", "Burjuva", "Soylular"],
    correct: 2
  },
  {
    id: 21,
    category: "Sanayi İnkılabı",
    question: "Sanayi İnkılabı ilk olarak hangi ülkede başlamıştır?",
    answers: ["Fransa", "İngiltere", "Almanya", "İtalya"],
    correct: 1
  },
  {
    id: 22,
    category: "Sanayi İnkılabı",
    question: "Sanayi İnkılabı'nı başlatan en önemli icat aşağıdakilerden hangisidir?",
    answers: ["Buhar makinesi", "Matbaa", "Pusula", "Teleskop"],
    correct: 0
  },
  {
    id: 23,
    category: "Sanayi İnkılabı",
    question: "Sanayi İnkılabı'nda fabrikalarda kullanılan en temel enerji kaynağı (yakıt) neydi?",
    answers: ["Petrol", "Doğal gaz", "Kömür", "Uranyum"],
    correct: 2
  },
  {
    id: 24,
    category: "Sanayi İnkılabı",
    question: "Sanayileşen ülkelerin, ürettikleri ürünleri satmak ve fabrikaları için gerekli hammaddeyi bulmak amacıyla yaptıkları faaliyet nedir?",
    answers: ["Haçlı Seferleri", "Rönesans", "Reform", "Sömürgecilik"],
    correct: 3
  },
  {
    id: 25,
    category: "Sanayi İnkılabı",
    question: "Hızlı kentleşme (şehirlere göç) sonucunda şehirlerde ortaya çıkan en önemli sorunlardan biri nedir?",
    answers: ["Fabrikaların kapanması", "Tarım alanlarının artması", "Çarpık kentleşme ve kirlilik", "İşçi bulunamaması"],
    correct: 2
  },
  {
    id: 26,
    category: "Fransız İhtilali",
    question: "Fransız İhtilali sırasında yayımlanan 'İnsan ve Yurttaş Hakları Bildirisi' en çok neyi vurgulamıştır?",
    answers: ["Kralın haklarını", "Özgürlük, eşitlik ve adalet", "Soyluların ayrıcalıklarını", "Kilisenin gücünü"],
    correct: 1
  },
  {
    id: 27,
    category: "Fransız İhtilali",
    question: "Fransız İhtilali'nin yaydığı milliyetçilik akımı, özellikle hangi tip devletleri olumsuz etkilemiştir?",
    answers: ["Sadece küçük devletleri", "Sadece zengin devletleri", "Çok uluslu imparatorlukları", "Demokratik devletleri"],
    correct: 2
  },
  {
    id: 28,
    category: "Fransız İhtilali",
    question: "Fransız İhtilali sonucunda hangi yönetim anlayışı zayıflamıştır?",
    answers: ["Demokrasi", "Cumhuriyet", "Mutlak Monarşi", "Laiklik"],
    correct: 2
  },
  {
    id: 29,
    category: "Fransız İhtilali",
    question: "Fransız İhtilali'nin başlamasına neden olan en önemli sorun hangisidir?",
    answers: ["Halkın ağır vergiler altında ezilmesi", "Sanayi İnkılabı'nın başlaması", "Kralın taç giymesi", "Coğrafi Keşifler"],
    correct: 0
  },
  {
    id: 30,
    category: "Fransız İhtilali",
    question: "Fransız İhtilali'nin dünyaca ünlü sloganı aşağıdakilerden hangisidir?",
    answers: ["Para, Güç, İktidar", "Barış, Ekmek, Toprak", "Tek Halk, Tek İmparatorluk, Tek Lider", "Özgürlük, Eşitlik, Kardeşlik"],
    correct: 3
  }
];

// Kategoriye göre soruları filtreleme fonksiyonu
export const getQuestionsByCategory = (category) => {
  return historyQuestions.filter(q => q.category === category);
};

// Rastgele soru seçme fonksiyonu
export const getRandomQuestions = (count = 10) => {
  const shuffled = [...historyQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Tüm kategorileri listeleme
export const getAllCategories = () => {
  return [...new Set(historyQuestions.map(q => q.category))];
};

export default historyQuestions;