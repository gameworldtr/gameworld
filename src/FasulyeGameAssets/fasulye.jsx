import React, { useEffect, useMemo, useRef, useState } from "react";
const SCALE = 4.5;      // sürükleme -> hız çarpanı (ARTTIRILDI)
const MAX_SPEED = 1250;     // başlangıç hızı üst sınırı (px/s)
import "./StyleFasulye.css"

// Import images
import arkaplanImg from './fasulyeGameAsset/arkaplan.jpg';
import kirmiziYastikImg from './fasulyeGameAsset/kırmızı_yastik.png';
import maviYastikImg from './fasulyeGameAsset/mavi_yastik.png';
import doluKirmiziImg from './fasulyeGameAsset/dolu_kırmızı.png';
import doluMaviImg from './fasulyeGameAsset/dolu_mavi.png';

// Import sounds
import sureSesiMp3 from './sound/sure.mp3';
import kazanmaSesiMp3 from './sound/kazanma.mp3';
import kaybetmeSesiMp3 from './sound/kaybetme.mp3';
import alkisSesiMp3 from './sound/alkis_sesi.mp3';

// Projectile Quiz Game — v29
// GÜNCELLEME: Hedef şekiller büyütülmüş haliyle korundu. Merkezi alanın genişliği
// orijinaline (280px margin) geri döndürüldü ve gri arkaplan ekranın en altına uzatıldı.

const QUESTION_BANK = {
  "Kolay": [
    {
      type: 'mcq',
      q: "Osmanlı'da bozulan kurumları onarmak ve ülkeyi dönemin ihtiyaçlarına göre yeniden düzenlemek amacıyla yapılan yenilik hareketlerine ne ad verilir?",
      a: ["Sömürgecilik",
        "İhtilal",
        "Darbe",
        "Islahat"], correct: 3
    },
    {
      type: 'mcq',
      q: "Lale Devri'nde ilk matbaanın kurulması hangi amaca ulaşmayı kolaylaştırmıştır?",
      a: ["Avrupa eğlence kültürünü yaymak.",
        "Sanatsal faaliyetleri artırmak",
        "Bilimsel eserlerin çoğaltılıp yayılması.",
        "Endüstriyel üretimi geliştirmek."], correct: 2
    },
    {
      type: 'mcq',
      q: "III. Selim döneminde, batılı tarzda kurulan ordunun adı nedir?",
      a: ["Tulummacılar Ocağı",
        "Nizâm-ı Cedid",
        "Asâkir-i Mansûre-i Muhammediyye",
        "Sekbân-ı Cedid"], correct: 3
    },
    {
      type: 'mcq',
      q: "Osmanlı Devleti'nin ilk resmi gazetesi olan Takvim-i Vekayi'nin çıkarılmasındaki temel amaç nedir?",
      a: ["Devletin kararlarını ve yenilikleri halka duyurmak.",
        "Ülkede yaşayan yabancılara bilgi ulaştırmak.",
        "Yapılan gizli işleri halka haber vermek.",
        "Sadece ticaret ve iş ilanlarını yayımlamak."], correct: 0
    },
    {
      type: 'mcq',
      q: "II. Mahmut döneminde Yeniçeri Ocağı'nın ortadan kaldırılması olayına, 'Hayırlı Olay' anlamına gelen 'Vaka-yı Hayriye' adının verilmesinin temel sebebi nedir?",
      a: ["Devletin yapacağı tüm yeniliklerin ve modernleşmenin önünün açılması.",
        "Osmanlı'da ilk kez asker sayısının tam olarak belirlenmesi.",
        "Kurulan yeni ordu ile bütçe yükünün ciddi oranda hafiflemesi. ",
        "Bu olayın ardından ilk defa Avrupa devletlerinden ekonomik destek alınması. "], correct: 0
    },
    {
      type: 'mcq',
      q: "II. Mahmut döneminde, Yeniçeri Ocağı 1826 yılında kaldırılarak bu olaya 'Vaka-yı Hayriye' (Hayırlı Olay) adı verilmiştir. Yeniçeri Ocağı'nın yerine kurulan ve modern sistemle eğitilen bu askeri birliğin adı nedir?",
      a: ["Nizam-ı Cedit Ordusu",
        "Tımarlı Sipahiler",
        "Sekban-ı Cedit Alayı ",
        "Asakir-i Mansure-i Muhammediye"], correct: 3
    },
    { type: 'tf', q: "Lale Devri’nde, günümüz itfaiye teşkilatının temelini oluşturan Tulumbacılar Ocağı kurulmuştur.", correct: true },
    { type: 'tf', q: "Nizâm-ı Cedid adı verilen Batı tarzı ordu, Sultan II. Mahmud döneminde kurulmuştur.", correct: false },
  ],
  "Kolay-Orta": [
    {
      type: 'mcq',
      q: "Posta Nezareti'nin kurulması ve telgrafın kullanılması hangi alanda ilerleme kaydettiğini gösterir?",
      a: ["İletişimi güçlendirmek ve kararları hızlandırmak.",
        "Yeni vergi toplama yöntemleri geliştirmek. ",
        "Askeri ihtiyaçları düzenli karşılamak. ",
        "İmar ve bayındırlık işlerine öncelik vermek. "], correct: 0
    },
    {
      type: 'mcq',
      q: "Sultan Abdülmecit döneminde, İzmir-Aydın demiryolu hattı döşenmesi ve İstanbul'da Şirket-i Hayriye (vapur işletmesi) kurulması, Osmanlı Devleti’nde öncelikli olarak hangi alandaki gelişimi hızlandırmıştır?",
      a: ["Askeri Güç ve Savunma",
        "Ulaşım ve Ticaret",
        "Eğitim ve Kültür",
        "Siyaset ve Yönetim"], correct: 1
    },
    {
      type: 'mcq',
      q: "Ziraat Bankası'nın kurulmasındaki temel amaç aşağıdakilerden hangisidir?",
      a: ["Ticari bankacılık işlemlerini merkezileştirmek.",
        "Çiftçileri tefeci borçlarından kurtarıp düşük faizli kredi sağlamak.",
        "Sanayi yatırımlarının finansmanını teşvik etmek.",
        "Dış borçları ödemek için ek gelir kaynağı oluşturmak."], correct: 1
    },
    {
      type: 'mcq',
      q: "Kanun-i Esasi'nin ilanıyla padişahın yetkileri ilk kez hangi yönetim biçimi altında sınırlandırılmıştır?",
      a: ["Saltanat Yönetimi",
        "Meşrutiyet Yönetimi",
        "Mutlak Monarşi",
        "Sınırsız Teokrasi"], correct: 1
    },
    {
      type: 'mcq',
      q: "II. Abdülhamit döneminde Kanun-i Esasi'nin ilanı ve Meşrutiyet'e geçilmesi, yönetimde hangi değişikliği göstermiştir?",
      a: ["Padişah yetkilerinin kanunla sınırlandırıldığı yeni bir sisteme geçiş.",
        "Ülke yönetiminin tamamen halkın seçtiği meclislerin kontrolüne bırakılması.",
        "Mutlak monarşi yönetiminin kalıcı ve güçlü bir şekilde devam ettirilmesi.",
        "Avrupa devletlerinin, Osmanlı siyasetinden tamamen uzaklaştırılması. "], correct: 0
    },
    {
      type: 'mcq',
      q: "Türk tarihinin ilk anayasası olan Kanun-i Esasi'nin ilan edilmesi hangi padişah döneminde yapılmıştır?",
      a: ["Sultan II. Abdülhamit",
        "Sultan III. Selim",
        "Sultan Abdülaziz",
        "Sultan III. Ahmet"], correct: 0
    },
    {
      type: 'mcq',
      q: "Amacı 'Suriye, Mekke ve Medine'yi birbirine bağlamak' olarak açıklanan ve Sultan II. Abdülhamit'in en önemli projelerinden biri olan ulaşım projesi aşağıdakilerden hangisidir?",
      a: ["Matbaa-i Âmire",
        "Dîvân-ı Hümâyun",
        "Hicaz Demiryolu",
        "Memleket Sandıkları "], correct: 2
    },
    { type: 'tf', q: "Yeniçeri Ocağı’nın kaldırılması olayına “Vaka-yı Hayriye” (Hayırlı Olay) denir. ", correct: true },
    { type: 'tf', q: "Türk tarihinin ilk anayasası olan Kanun-i Esasi, Sultan II. Abdülhamit döneminde ilan edilmiştir.", correct: true },
  ],
  "Orta": [
    {
      type: 'mcq',
      q: "Lale Devri yeniliklerinden olan matbaanın kurulması ve geçici elçiliklerin açılması hangi alanlara aittir?",
      a: ["Kültürel ve askeri. ",
        "Eğitim/sanat ve dış ilişkiler. ",
        "Hukuksal ve sosyal refah. ",
        "Ekonomik ve yönetim biçimi."], correct: 1
    },
    {
      type: 'mcq',
      q: "Lale Devri'nde çini, kağıt ve dokuma atölyelerinin kurulması hangi alandaki üretimi desteklemiştir?",
      a: ["Askeri alandaki gücü yükseltmeyi amaçlamıştır",
        "Sanayi/el sanatları üretimini artırıp dışa bağımlılığı azaltmak. ",
        "Ülkenin devletler arası siyasi ilişkilerini güçlendirmek.",
        "Okuryazar oranını artırmak. "], correct: 1
    },
    {
      type: 'mcq',
      q: "İstanbul'da ilk kez çini atölyesi açılması ve halk sağlığı alanında önemli bir adım olan çiçek aşısının ilk kez uygulanmaya başlanması, Osmanlı Devleti'nin hangi döneminde gerçekleşen yeniliklerdir?",
      a: ["Tanzimant Dönemi ",
        "Lale Devri ",
        "Fetret Devri ",
        "Sultan II. Abdülhamit Dönemi "], correct: 1
    },
    {
      type: 'mcq',
      q: "Nizam-ı Cedid ordusunun masraflarını karşılamak için kurulan özel hazinenin adı nedir?",
      a: ["Ganimet Hazinesi",
        "İrad-ı Cedid Hazinesi",
        "Cizye Fonu",
        "Maliye-i Hassa"], correct: 1
    },
    {
      type: 'mcq',
      q: "III. Selim'in (Nizam-ı Cedid) yenilikleri gerçekleştirirken karşılaştığı en büyük zorluk aşağıdakilerden hangisidir?",
      a: ["Halkın, padişahı Batı'ya özenmekle suçlaması. ",
        "Avrupa devletlerinin yeniliklere maddi destek vermemesi. ",
        "Yeniçerilerin ve din adamlarının çıkarları bozulduğu için yeniliklere karşı çıkması. ",
        "Ekonomik durumun çok iyi olması nedeniyle yenilik ihtiyacının hissedilmemesi."], correct: 2
    },
    {
      type: 'mcq',
      q: "Osmanlı Devleti'nde, memurlar arasında tek tip ve resmi bir görünüm oluşturmak amacıyla, fes, pantolon ve ceket giyme zorunluluğunu getiren padişah aşağıdakilerden hangisidir?",
      a: ["Sultan Abdülmecid ",
        "Sultan III. Selim ",
        "Sultan II. Abdülhamid ",
        "Sultan II. Mahmut"], correct: 3
    },
    {
      type: 'mcq',
      q: "Sultan II. Mahmut döneminde Rüştiye ve Harp Okulu gibi yeni okulların açılmasındaki temel amaç nedir?",
      a: ["Sanat ve kültür alanında eğitimi yaymak. ",
        "Devlete modern memur ve subay yetiştirmek. ",
        "Medrese eğitimini tamamen sona erdirmek. ",
        "Eğitime yapılan masrafları dengelemek."], correct: 1
    },
    {
      type: 'mcq',
      q: "Osmanlı İmparatorluğu'nda modernleşme sürecinde, devlet gelir ve giderlerini merkezileştirmek, bütçe disiplinini sağlamak amacıyla kurulan kurum hangisidir?",
      a: ["Darülaceze ",
        "Maliye Nazırlığı ",
        "Hariciye Nazırlığı",
        "Darüşşafaka"], correct: 1
    },
    { type: 'tf', q: "Ziraat Bankası’nın temelini oluşturan Memleket Sandıkları, Sultan Abdülaziz döneminde kurulmuştur.", correct: true }
  ],
  "Orta-Zor": [
    {
      type: 'mcq',
      q: "Sultan Abdülmecit döneminde, mektuplar, çeşitli eşyalar ve paraların taşınmasında daha fazla güvenlik ve düzen sağlamak amacıyla kurulan kurum aşağıdakilerden hangisidir?",
      a: ["Telgrafhane Müdürlüğü",
        "Matbaa-i Amire",
        "Darphane-i Amire",
        "Posta Nezareti"], correct: 3
    },
    {
      type: 'mcq',
      q: "Osmanlı'da askeri okullar dışındaki tüm eğitimi tek çatı altında toplayan, günümüz Milli Eğitim Bakanlığı'nın temeli sayılan kurum hangisidir?",
      a: ["Şirket-i Hayriye",
        "Maarif Nezareti",
        "Posta Nezareti",
        "Darülfünun"], correct: 1
    },
    {
      type: 'mcq',
      q: "Sultan Abdülaziz döneminde kurulan ve Ziraat Bankası'nın temeli olan kurumun adı nedir?",
      a: ["İrâd-ı Cedid Sandıkları",
        "Mecelle Sandıkları",
        "Memleket Sandıkları",
        "Divan Sandıkları"], correct: 2
    },
    {
      type: 'mcq',
      q: "Osmanlı Devleti'nin ilk medeni kanunu olan 'Mecelle' hangi padişah döneminde hazırlanarak yürürlüğe girmiştir?",
      a: ["Sultan Abdülmecit",
        "Sultan Abdülaziz",
        "Sultan II. Mahmud",
        "Sultan II. Abdülhamit"], correct: 1
    },
    {
      type: 'mcq',
      q: "Darüşşafaka (Şefkat Yuvası) Osmanlı'da hangi padişah döneminde ve hangi amaçla kurulmuştur?",
      a: ["Sultan Abdülmecid – Batı tarzı üniversite kurmak.",
        "Sultan Abdülaziz – Yetim ve fakir çocuklara parasız yatılı eğitim vermek.",
        "II. Abdülhamid – Kız çocuklarının mesleki eğitimini desteklemek.",
        "III. Selim – Avrupa dilleri bilen diplomat yetiştirmek."], correct: 1
    },
    {
      type: 'mcq',
      q: "Sultan Abdülaziz döneminde (1868) faaliyete geçen ve Osmanlı Devleti'nin modern anlamdaki ilk üniversitesi sayılan yükseköğretim kurumu hangisidir?",
      a: ["Mekteb-i Sultani ",
        "Darüşşafaka",
        "Darülfünun",
        "Mekteb-i Mülkiye"], correct: 2
    },
    {
      type: 'mcq',
      q: "Osman Hamdi Bey tarafından kurulan Sanayi-i Nefise Mektebi'nin (Güzel Sanatlar Okulu) temel amacı nedir?",
      a: ["Ülkede modern tıp alanında doktor ve cerrah yetiştirmeyi hızlandırmak. ",
        "Askeri birliklerin eğitimi ve cephedeki disiplinin sağlanması. ",
        "Ülkeye modern Batı tarzı mimarlık ve resim sanatçıları yetiştirmek. ",
        "Türk tarihini ve kültürünü dünyaya tanıtacak yeni bir bilim akademisi kurmak. "], correct: 2
    },
    {
      type: 'mcq',
      q: "II. Abdülhamit döneminde kimsesiz ve yardıma muhtaç kişiler için Darülaceze'nin (Koruma Evi) açılması, Osmanlı'nın hangi alana öncelik verdiğini gösterir?",
      a: ["Merkezi otoriteyi güçlendirmek için idari reformlar yapmak.",
        "Eğitim sistemi içindeki medreselerin etkisini ortadan kaldırmak. ",
        "Sosyal devlet anlayışıyla halkın ihtiyaçlarını karşılamak. ",
        "Yeni sanayi tesisleri açarak pazar gücünü artırmak. "], correct: 2
    },
    { type: 'tf', q: "Sultan II. Mahmud döneminde, Yeniçeri Ocağı’nın yerine Asâkir-i Mansûre-i Muhammediyye adıyla yeni bir ordu kurulmuştur.", correct: true },
  ],
  "Zor": [
    {
      type: 'mcq',
      q: "Lale Devri'nden II. Abdülhamit dönemine kadar yapılan tüm ıslahatların ortak ve temel amacı nedir?",
      a: [
        "Devletin sınırlarını genişletmek.",
        "Padişah yetkilerini tamamen ortadan kaldırmak.",
        "Avrupa bilim, teknoloji ve kültüründen geri kalmamak.",
        "Tüm azınlıkları ülke dışına çıkarmak."], correct: 2
    },
    {
      type: 'mcq',
      q: "Lale Devri'nde Avrupa'daki gelişmeleri yakından takip için geçici elçiliklerin açılması, Osmanlı'nın hangi alana öncelik verdiğini gösterir?",
      a: [
        "Kültürel canlandırma.",
        "Askeri teknolojiyi yenileme.",
        "Ekonomi/ticaret geliştirme.",
        "Batı bilimini ülkeye getirme."], correct: 3
    },
    {
      type: 'mcq',
      q: "Osmanlı tarihinde bir huzur, zevk ve yenilik dönemi olarak bilinen Lale Devri'ni başlatan ve bu döneme son veren olaylar sırasıyla hangi şıklarda doğru verilmiştir?",
      a: [
        "Karlofça Antlaşması - Edirne Vakası",
        "Pasarofça Antlaşması - Patrona Halil İsyanı",
        "Prut Antlaşması - Kabakçı Mustafa İsyanı",
        "Zitvatorok Antlaşması - Vaka-i Hayriye"], correct: 1
    },
    {
      type: 'mcq',
      q: "Aşağıdakilerden hangisi, Lale Devri'nde (1718-1730) toplumsal bir ihtiyacı gidermek amacıyla Avrupa'dan örnek alınarak kurulan ve dönemin en önemli yeniliklerinden biri sayılan kurumdur?",
      a: [
        "İlk Osmanlı matbaası.",
        "Barok/Rokoko mimarisi.",
        "İlk itfaiye teşkilatı (Tulumbacılar Ocağı).",
        "Avrupa başkentlerine elçi gönderme."], correct: 2
    },
    {
      type: 'mcq',
      q: "III. Selim döneminde Avrupa başkentlerinde (Londra, Paris vb.) daimi elçiliklerin kurulmasındaki temel amaç aşağıdakilerden hangisidir?",
      a: [
        "Osmanlı tüccarlarının uluslararası pazarlara girişini kolaylaştırmak.",
        "Osmanlı kültürünü ve sanatını Avrupa halkına tanıtmayı sağlamak.",
        "Avrupa devletlerinin siyasi ve askeri gücünü yakından izlemek.",
        "Elçilik gelirleriyle sarayın bütçe açıklarını kalıcı olarak kapatmak."], correct: 2
    },
    {
      type: 'mcq',
      q: "Topçu subayı yetiştirmek amacıyla III. Selim döneminde açılan, Kara Mühendishanesi olarak da bilinen kurum nedir?",
      a: [
        "Asâkir-i Mansûre-i Muhammediyye.",
        "Mühendishâne-i Berrî-i Hümâyun.",
        "Mekteb-i Tıbbiye.",
        "İrâd-ı Cedid."], correct: 1
    },
    {
      type: 'mcq',
      q: "1807 yılında, ıslahat karşıtı yeniçeriler ve ulemanın desteğiyle Kabakçı Mustafa'nın başlattığı isyan, hangi önemli siyasi sonuca yol açmıştır?",
      a: [
        "Osmanlı'nın ilk resmî gazetesi olan Takvim-i Vekayi'nin yayımlanmaya başlaması.",
        "Osmanlı ordusunun Batı tarzı eğitimi tamamen bırakıp eski sistemine geri dönmesi.",
        "Padişah III. Selim döneminin sona ermesi ve Nizâm-ı Cedid ordusunun dağıtılması.",
        "Tanzimat Fermanı'nın ilan edilerek Osmanlı Devleti'nde hukuk üstünlüğünün kabul edilmesi."], correct: 2
    },
    { type: 'tf', q: "Osmanlı Devleti’nin ilk medeni kanunu olan Mecelle, Sultan Abdülmecit döneminde hazırlanmıştır.", correct: false },
    { type: 'tf', q: "Hicaz Demiryolu projesinin amacı İstanbul ile Bağdat’ı birbirine bağlamaktır.", correct: false },
    { type: 'tf', q: "Avrupa’da ilk geçici elçilikler Sultan III. Selim döneminde açılmaya başlanmıştır. ", correct: false },
  ],
  "Çok Zor": [
    {
      type: 'mcq',
      q: "II. Mahmut döneminde Tımar Sistemi'nin kaldırılması, merkezi otoriteyi nasıl güçlendirmiştir?",
      a: [
        "Taşra yönetimini doğrudan İstanbul'a bağladı.",
        "Tarımsal üretimi artırdı.",
        "Padişahın sefere katılma zorunluluğunu kaldırdı.",
        "Avrupa'dan uzman getirerek eğitimi artırdı."], correct: 0
    },
    {
      type: 'mcq',
      q: "II. Mahmut döneminde Divân-ı Hümâyun'un kaldırılarak yerine Nazırlıklar sisteminin kurulmasındaki temel amaç nedir?",
      a: [
        "Yönetime halkın fikrini sorma ve katılımı artırma amacı gütmek.",
        "Yabancı uzmanların devlet işlerine daha rahat girmesini sağlamak.",
        "Devletin bütün gücünü tek elde toplayıp yönetimi daha düzenli hale getirmek.",
        "Yapılacak yeniliklerin devlete olan masrafını azaltmak ve para biriktirmek."], correct: 2
    },
    {
      type: 'mcq',
      q: "II. Mahmut döneminde, Osmanlı tarihinde ilk kez resmi bir nüfus sayımı yapılmıştır. Aşağıdakilerden hangisi, bu nüfus sayımının yapılma amaçlarından biri değildir?",
      a: [
        "Yapılacak askerlik hizmeti için erkek sayısını belirlemek.",
        "Devletin vergi alacağı kişileri ve haneleri tespit etmek.",
        "Ülkedeki toplam kadın ve çocuk sayısını tam olarak bilmek.",
        "Devletin askeri gücünü ve potansiyelini öğrenmek."], correct: 2
    },
    {
      type: 'mcq',
      q: "Sultan Abdülmecid döneminde Maarif Nezareti (Eğitim Bakanlığı) kuruldu ve okullar bu kuruma bağlandı.  Fakat, geleneksel eğitim veren medreseler dahil edilmedi. Bu durumun Osmanlı eğitim sisteminde yol açtığı temel sorun nedir?",
      a: [
        "Ülkedeki öğretmen sayısı azaldı.",
        "Eğitim yönetiminde ikilik (çift başlılık) çıktı.",
        "Eğitimde bilgi karışıklığı oluştu.",
        "Yeni açılan okulların masrafları çok arttı."], correct: 1
    },
    {
      type: 'mcq',
      q: "II. Abdülhamit döneminde Bağdat ve Hicaz demiryollarının açılmasının Osmanlı'ya en önemli katkısı nedir?",
      a: [
        "Devletin uzak bölgelerdeki otoritesini sağlamlaştırması.",
        "Sadece devlet hazinesi gelirlerinin artırılması.",
        "Uluslararası ticaret hacmini küresel boyuta ulaştırması.",
        "Azınlık grupların ayrılıkçı hareketlerini bitirmesi."], correct: 0
    },
    {
      type: 'mcq',
      q: "Osmanlı Devleti'nde, modern eğitim kurumları olan Darülfünun ve Darüşşafaka'nın kurulması, devletin öncelikli olarak hangi alana yatırım yaptığını gösterir?",
      a: [
        "Dış siyasetin güçlendirilmesi ve diplomatik ilişkiler.",
        "Posta ve telgraf ağını geliştirmek.",
        "Modern eğitimle toplumsal gelişme ve fırsat eşitliğini hedeflemek.",
        "Sanayi üretimini taklit ederek ekonomik bağımsızlığı sağlamak."], correct: 2
    },
    { type: 'tf', q: "Lale Devri’nde sağlık alanında ilk defa çiçek aşısı uygulanmaya başlanmıştır.", correct: true },
    { type: 'tf', q: "İstanbul’da Boğaziçi vapur işletmeciliğini yapmak için Sultan Abdülaziz döneminde kurulan şirketin adı “Şirket-i Derya”dır.", correct: false },
    { type: 'tf', q: "Anadolu’daki ilk demiryolu hattı, İzmir-Aydın arasında işletmeye açılmıştır.", correct: true },
  ]
};

const DIFF_POINTS = {
  "Kolay": 1,
  "Kolay-Orta": 2,
  "Orta": 3,
  "Orta-Zor": 4,
  "Zor": 5,
  "Çok Zor": 6,
};

// Şekil boyutları büyütülmüş haliyle korundu.
const SHAPES = [
  { key: "hex", label: "Altıgen", color: "#facc15", diff: "Çok Zor", points: 6, sides: 6, size: 120 },
  { key: "square", label: "Kare", color: "#22c55e", diff: "Zor", points: 5, sides: 4, size: 130 },
  { key: "pent", label: "Beşgen", color: "#f472b6", diff: "Orta-Zor", points: 5, sides: 5, size: 140 },
  { key: "tri", label: "Üçgen", color: "#ef4444", diff: "Orta", points: 3, sides: 3, size: 150 },
  { key: "circle", label: "Yuvarlak", color: "#3b82f6", diff: "Kolay-Orta", points: 2, sides: 0, size: 165 },
  { key: "rect", label: "Dikdörtgen", color: "#2dd4bf", diff: "Kolay", points: 1, sides: 4, size: 180, rect: true },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function TrajectoryPreview({ points }) {
  if (!points || points.length < 2) {
    return null;
  }
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div
      className="fasulye-trajectory"
      style={{ zIndex: 9999 }}
    >
      <svg width="100%" height="100%">
        <path
          d={pathData}
          stroke="#0f172a"
          strokeWidth="10"
          fill="none"
          strokeDasharray="4 15"
          strokeLinecap="round"
          opacity={0.5}
        />
      </svg>
    </div>
  );
}

// Soru tiplerini yönetecek bileşen
function QuestionModal({ qItem, captured, timeLeft, feedback, onAnswer, timerAudioRef, correctAudioRef, wrongAudioRef }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [userPairs, setUserPairs] = useState([]);

  const shuffledRight = useMemo(() => {
    if (qItem && qItem.type === 'matching') {
      const rightSide = qItem.pairs.map(p => p[1]);
      return rightSide.sort(() => Math.random() - 0.5);
    }
    return [];
  }, [qItem]);
  


  useEffect(() => {
    setSelectedLeft(null);
    setUserPairs([]);
  }, [qItem]);

  const handleLeftClick = (index, item) => {
    if (feedback) return;
    setSelectedLeft({ index, item });
  };

  const handleRightClick = (index, item) => {
    if (selectedLeft === null || feedback) return;
    if (userPairs.some(p => p.right.index === index)) return;

    setUserPairs([...userPairs, { left: selectedLeft, right: { index, item } }]);
    setSelectedLeft(null);
  };

  const checkMatchingAnswers = () => {
    if (userPairs.length !== qItem.pairs.length) return;
    const correctMap = new Map(qItem.pairs);
    let correctCount = 0;
    userPairs.forEach(pair => {
      if (correctMap.get(pair.left.item) === pair.right.item) {
        correctCount++;
      }
    });
    onAnswer(correctCount === qItem.pairs.length);
  };

  const getPairingStatusClass = (side, index) => {
    let baseClass = 'fasulye-matching-item';
    if (selectedLeft && side === 'left' && selectedLeft.index === index) {
      return `${baseClass} fasulye-matching-selected`;
    }
    if (userPairs.some(p => p[side].index === index)) {
      return `${baseClass} fasulye-matching-paired`;
    }
    return baseClass;
  }


  const renderQuestion = () => {
    switch (qItem.type) {
      case 'tf':
        return (
          <div className="fasulye-question-options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button onClick={() => onAnswer(true)} disabled={!!feedback} className="fasulye-option-button">Doğru</button>
            <button onClick={() => onAnswer(false)} disabled={!!feedback} className="fasulye-option-button">Yanlış</button>
          </div>
        );
      case 'matching':
        const leftSide = qItem.pairs.map(p => p[0]);
        return (
          <div>
            <div className="fasulye-matching-grid">
              <div className="fasulye-matching-column">
                {leftSide.map((item, index) => (
                  <button
                    key={`left-${index}`}
                    onClick={() => handleLeftClick(index, item)}
                    disabled={userPairs.some(p => p.left.index === index) || !!feedback}
                    className={`p-2 border rounded-lg text-sm text-center transition-colors ${getPairingStatusClass('left', index)}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {shuffledRight.map((item, index) => (
                  <button
                    key={`right-${index}`}
                    onClick={() => handleRightClick(index, item)}
                    disabled={userPairs.some(p => p.right.index === index) || !!feedback}
                    className={`p-2 border rounded-lg text-sm text-center transition-colors ${getPairingStatusClass('right', index)}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {userPairs.length === qItem.pairs.length && !feedback && (
            <button
                onClick={checkMatchingAnswers}
                className="fasulye-matching-submit"
              >
                Cevapları Kontrol Et
              </button>
            )}
          </div>
        );
      case 'mcq':
      default:
        return (
          <div className="fasulye-question-options">
            {qItem.a.map((opt, i) => (
              <button key={i}
                onClick={() => onAnswer(i)}
                disabled={!!feedback}
                className="fasulye-option-button"
              >{opt}</button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fasulye-modal-overlay">
      <div className="fasulye-modal" style={{ borderColor: captured.color }}>
        <div className="fasulye-timer-wrapper">
          <div style={{ position: 'relative', width: '3rem', height: '3rem' }}>
            <svg className="fasulye-timer-svg" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#e5e7eb" strokeWidth="3.5" />
              <circle
                className={timeLeft <= 5 ? "text-red-600" : "text-indigo-600"}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                cx="18" cy="18" r="15.9155" fill="transparent" stroke="currentColor" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={100 - (timeLeft / 45) * 100} strokeLinecap="round"
              />
            </svg>
           <div className={`fasulye-timer-text ${timeLeft <= 5 ? "fasulye-timer-warning" : "fasulye-timer-normal"}`}>
              {timeLeft}
            </div>
          </div>
        </div>
       <div className="fasulye-question-header">
          <h2 className="fasulye-question-title">Soru • {qItem.diff} ({DIFF_POINTS[qItem.diff]} puan)</h2>
        </div>
        <div className="fasulye-question-shape">
          <ShapePreview shape={captured} size={120} />
        </div>
        <p className="fasulye-question-text">{qItem.q}</p>
        {renderQuestion()}
        {feedback && (
          <div className={`fasulye-feedback ${feedback.startsWith("Doğru") ? "fasulye-feedback-correct" : "fasulye-feedback-incorrect"}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}


export default function GameProjectileQuiz() {
  const containerRef = useRef(null);
  const [playerNames, setPlayerNames] = useState({ 1: "", 2: "" });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [pScore, setPScore] = useState({ 1: 0, 2: 0 });
  const [pShots, setPShots] = useState({ 1: 0, 2: 0 });
  const [pCorrect, setPCorrect] = useState({ 1: 0, 2: 0 });
  const [pWrong, setPWrong] = useState({ 1: 0, 2: 0 });
  const [round, setRound] = useState(1);
  const [turnsInRound, setTurnsInRound] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [note, setNote] = useState(null);
  const [previewPoints, setPreviewPoints] = useState([]);
  const [powerPct, setPowerPct] = useState(0);
  const [world] = useState({ width: 1536, height: 780, gravity: 980 });
  const [captured, setCaptured] = useState(null);
  const [showQ, setShowQ] = useState(false);
  const [qItem, setQItem] = useState(null);
  const [qOwner, setQOwner] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
const timerAudioRef = useRef(null);
const correctAudioRef = useRef(null);
const wrongAudioRef = useRef(null);
const applauseAudioRef = useRef(null);

  const spawnLeft = { x: 120, y: world.height - 400 };
  const spawnRight = { x: world.width - 120, y: world.height - 400 };

  const [ball, setBall] = useState({ x: spawnLeft.x, y: spawnLeft.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
  const [drag, setDrag] = useState({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });

  // DEĞİŞİKLİKLER UYGULANDI:
  // 1. Duvar/Alan genişliği 280px margin'de korundu.
  // 2. Şekillerin dikey yayılımı biraz artırıldı.
  const layout = useMemo(() => {
    // Merkezi alan genişliğini koru (280px margin)
    const wallLeftX = 280;
    const wallRightX = world.width - 280;
    const playAreaWidth = wallRightX - wallLeftX;

    // 3 Sütun için X konumları (merkezden)
    const colXs = [
      wallLeftX + (playAreaWidth * 0.20), // Sütun 1
      wallLeftX + (playAreaWidth * 0.50), // Sütun 2
      wallLeftX + (playAreaWidth * 0.80), // Sütun 3
    ];

    // YENİ: Şekilleri dikeyde daha fazla yaymak için Y konumları ayarlandı.
    const wallTopY = (world.height / 2) - 100; // 240
    const wallBottomY = world.height - 180; // 600
    const playAreaCenterY = (wallTopY + wallBottomY) / 2; // 420
    const verticalSeparation = 130; // Merkezi ayırma mesafesi artırıldı (önce 100)

    const row1Y = playAreaCenterY - verticalSeparation; // Üst satır Y (420 - 130 = 290)
    const row2Y = playAreaCenterY + verticalSeparation; // Alt satır Y (420 + 130 = 550)

    // "kaydırma" (jitter) miktarı korundu
    const jitters = [
      { x: -10, y: 5 },  // hex
      { x: 20, y: -10 }, // square
      { x: -15, y: 15 }, // pent
      { x: 15, y: -5 },  // tri
      { x: -20, y: 10 }, // circle
      { x: 10, y: -15 }, // rect
    ];

    const topRowShapes = SHAPES.slice(0, 3);
    const bottomRowShapes = SHAPES.slice(3, 6);

    const mapShape = (s, indexInRow, yPos) => {
      const x = colXs[indexInRow];
      const y = yPos;
      const originalIndex = SHAPES.findIndex(shape => shape.key === s.key);
      const jitter = jitters[originalIndex] || { x: 0, y: 0 };
      const w = s.rect ? Math.round(s.size * 1.5) : s.size;
      const h = s.rect ? Math.round(s.size * 0.9) : s.size;
      const cx = x + jitter.x;
      const cy = y + jitter.y;
      const outerR = Math.min(w, h) / 2 - 2;
      return { ...s, x: cx, y: cy, w, h, cx, cy, outerR };
    };

    const topLayout = topRowShapes.map((s, i) => mapShape(s, i, row1Y));
    const bottomLayout = bottomRowShapes.map((s, i) => mapShape(s, i, row2Y));

    return [...topLayout, ...bottomLayout];

  }, [world.height, world.width]);


  const finishTurnAndMaybeNextRound = () => {
    setTurnsInRound((t) => {
      const nt = t + 1;
      if (nt >= 2) {
        setRound((r) => r + 1);
        return 0;
      }
      return nt;
    });
  };

  const switchToOtherPlayer = (currOwner) => {
    const nextP = currOwner === 1 ? 2 : 1;
    const spawn = nextP === 1 ? spawnLeft : spawnRight;
    setCurrentPlayer(nextP);
    setBall({ x: spawn.x, y: spawn.y - 120, r: 20, vx: 0, vy: 0, inFlight: false, owner: nextP });
  };

  const onPointerDown = (e) => {
    if (ball.inFlight || showQ || showEnd) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (dx * dx + dy * dy <= (ball.r + 24) * (ball.r + 24)) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { }
      setDrag({ active: true, sx: x, sy: y, cx: x, cy: y, pointerId: e.pointerId });
      setFeedback(null);
      setPreviewPoints([]);
    }
  };

  const onPointerMove = (e) => {
    if (!drag.active) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrag((d) => {
      const nd = { ...d, cx: x, cy: y };
      const dx = nd.cx - nd.sx;
      const dy = nd.cy - nd.sy;
      let vx0 = -(dx) * SCALE;
      let vy0 = -(dy) * SCALE;
      const sp = Math.hypot(vx0, vy0);
      if (sp > MAX_SPEED && sp > 0) {
        const k = MAX_SPEED / sp;
        vx0 *= k; vy0 *= k;
      }
      const pct = Math.round(Math.min(sp, MAX_SPEED) / MAX_SPEED * 100);
      setPowerPct(pct);
      const pts = predictTrajectory(ball.x, ball.y, vx0, vy0, world.gravity, world.width, world.height);
      setPreviewPoints(pts);
      return nd;
    });
  };

  function releaseShot() {
    if (!drag.active) return;
    const dx = drag.cx - drag.sx;
    const dy = drag.cy - drag.sy;
    let vx = -(dx) * SCALE;
    let vy = -(dy) * SCALE;
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_SPEED && sp > 0) {
      const k = MAX_SPEED / sp;
      vx *= k; vy *= k;
    }
    setBall((b) => ({ ...b, vx, vy, inFlight: true }));
    setDrag({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });
    setPreviewPoints([]);
    setPowerPct(0);
    setPShots((ps) => ({ ...ps, [currentPlayer]: ps[currentPlayer] + 1 }));
  }

  const onPointerUp = (e) => {
    if (drag.pointerId != null) {
      try { e.currentTarget.releasePointerCapture(drag.pointerId); } catch { }
    }
    releaseShot();
  };

  const onPointerCancel = () => {
    setDrag({ active: false, sx: 0, sy: 0, cx: 0, cy: 0, pointerId: null });
    setPreviewPoints([]);
  };

  // Initialize and preload audio
useEffect(() => {
  const timerAudio = new Audio(sureSesiMp3);
  timerAudio.preload = 'auto';
  timerAudio.load();
  timerAudioRef.current = timerAudio;

  const correctAudio = new Audio(kazanmaSesiMp3);
  correctAudio.preload = 'auto';
  correctAudio.load();
  correctAudioRef.current = correctAudio;

  const wrongAudio = new Audio(kaybetmeSesiMp3);
  wrongAudio.preload = 'auto';
  wrongAudio.load();
  wrongAudioRef.current = wrongAudio;

  const applauseAudio = new Audio(alkisSesiMp3);
  applauseAudio.preload = 'auto';
  applauseAudio.load();
  applauseAudioRef.current = applauseAudio;

  return () => {
    if (timerAudioRef.current) {
      timerAudioRef.current.pause();
    }
  };
}, []);

  useEffect(() => {
    let mounted = true;
    let last = performance.now();
    const tick = (now) => {
      if (!mounted) return;
      const dt = (now - last) / 1000;
      last = now;
      setBall((b) => {
        if (!b.inFlight || showQ || showEnd) return b;
        let { x, y, vx, vy, r } = b;

        // FİZİK DEĞİŞMİYOR
        vy += world.gravity * dt;
        x += vx * dt;
        y += vy * dt;
        const damping = 0.8;

        // === YENİ VE DÜZELTİLMİŞ DUVAR FİZİĞİ ===
        // Bu kod, görsel duvarlarla tam olarak hizalıdır.
        const wallLeftStart = 280 - 20; // Duvarın sol kenarı (260)
        const wallLeftEnd = 280;        // Duvarın sağ kenarı (280)
        const wallRightStart = world.width - 280; // Duvarın sol kenarı (1256)
        const wallRightEnd = wallRightStart + 20; // Duvarın sağ kenarı (1276)
        const wallTop = (world.height / 2) - 100 - 50; // Duvarların üst hizası (240)

        // Sadece duvarların dikey hizasındaysa çarpışmayı kontrol et
        if (y + r > wallTop) {

          // --- SOL DUVAR (260-280 arası) ---

          // 1. DIŞ TARAFA ÇARPMA (Soldan sağa gelirken, vx > 0)
          if (vx > 0 && (x + r) > wallLeftStart && (x + r) < (wallLeftEnd + r)) {
            vx = -vx * damping;
            x = wallLeftStart - r; // Sekme ve yapışmayı önle
          }

          // 2. İÇ TARAFA ÇARPMA (Sağdan sola gelirken, vx < 0)
          // (Eksik olan kod buydu)
          if (vx < 0 && (x - r) < wallLeftEnd && (x - r) > (wallLeftStart - r)) {
            vx = -vx * damping;
            x = wallLeftEnd + r; // Sekme ve yapışmayı önle
          }

          // --- SAĞ DUVAR (1256-1276 arası) ---

          // 3. İÇ TARAFA ÇARPMA (Soldan sağa gelirken, vx > 0)
          // (Eksik olan kod buydu)
          if (vx > 0 && (x + r) > wallRightStart && (x + r) < (wallRightEnd + r)) {
            vx = -vx * damping;
            x = wallRightStart - r; // Sekme ve yapışmayı önle
          }

          // 4. DIŞ TARAFA ÇARPMA (Sağdan sola gelirken, vx < 0)
          if (vx < 0 && (x - r) < wallRightEnd && (x - r) > (wallRightStart - r)) {
            vx = -vx * damping;
            x = wallRightEnd + r; // Sekme ve yapışmayı önle
          }
        }
        // === YENİ FİZİK BİTİŞİ ===


        // Mevcut dünya sınırı kontrolleri (KORUNDU)
        if (x - r < 0) { x = r; vx = -vx * damping; }

        // Mevcut dünya sınırı kontrolleri (KORUNDU)
        if (x - r < 0) { x = r; vx = -vx * damping; }
        if (x + r > world.width) { x = world.width - r; vx = -vx * damping; }
        if (y - r < 0) { y = r; vy = -vy * damping; }

        if (y - r > world.height + 80) {
          setPScore((ps) => ({ ...ps, [b.owner]: ps[b.owner] - 1 }));
          const ownerName = playerNames[b.owner] || `P${b.owner}`;
          setNote(`${ownerName}: -1 puan`);
          setTimeout(() => setNote(null), 1200);
          finishTurnAndMaybeNextRound();
          switchToOtherPlayer(b.owner);
          return { ...b, inFlight: false };
        }
        let hit = null;
        for (let i = 0; i < layout.length; i++) {
          const s = layout[i];
          if (pointHitsShape(x, y, s)) { hit = s; break; }
        }
        if (hit) {
          openQuestion(hit, b.owner);
          switchToOtherPlayer(b.owner);
          return { ...b, inFlight: false };
        }
        return { ...b, x, y, vx, vy };
      });
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [world.gravity, world.width, world.height, layout, playerNames, showQ, showEnd]);

useEffect(() => {
  const audio = timerAudioRef.current;
  if (showQ && !feedback) {
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(e => console.error("Ses çalınamadı:", e));
  } else if (feedback) {
    audio.pause();
    audio.loop = false;
  }

  return () => {
    if (feedback) {
      audio.pause();
    }
  };
}, [showQ, feedback]);

  useEffect(() => {
    if (!showQ || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [showQ, timeLeft]);

  useEffect(() => {
  const audios = [
    timerAudioRef.current,
    correctAudioRef.current,
    wrongAudioRef.current,
    applauseAudioRef.current
  ];
  
  // Preload all audio files
  audios.forEach(audio => {
    audio.load();
    audio.preload = 'auto';
  });
}, []);

  function openQuestion(shape, ownerWhoShot) {
    const pool = QUESTION_BANK[shape.diff] || [];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setQItem({ ...pick, diff: shape.diff });
    setCaptured(shape);
    setQOwner(ownerWhoShot);
    setShowQ(true);
    setTimeLeft(45);
  }

  function handleTimeUp() {
    if (!qItem || feedback) return;
    timerAudioRef.current.pause();
    timerAudioRef.current.loop = false;

    wrongAudioRef.current.currentTime = 0;
    wrongAudioRef.current.play().catch(e => console.error("Ses çalınamadı:", e));

    setFeedback("Süre doldu! :(");
    setPWrong((pw) => ({ ...pw, [qOwner]: pw[qOwner] + 1 }));
    setTimeout(() => {
      setShowQ(false);
      setFeedback(null);
      setQItem(null);
      setCaptured(null);
      setTimeLeft(null);
      finishTurnAndMaybeNextRound();
    }, 1200);
  }

  function handleAnswer(result) {
    if (!qItem || feedback) return;
    setTimeLeft(null);

    timerAudioRef.current.pause();
    timerAudioRef.current.loop = false;

    let isCorrect = false;
    switch (qItem.type) {
      case 'mcq':
        isCorrect = result === qItem.correct;
        break;
      case 'tf':
        isCorrect = result === qItem.correct;
        break;
      case 'matching':
        isCorrect = result;
        break;
      default:
        break;
    }

    setFeedback(isCorrect ? "Doğru!" : "Yanlış :(");

    if (isCorrect) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(e => console.error("Ses çalınamadı:", e));
      setPScore((ps) => ({ ...ps, [qOwner]: ps[qOwner] + (DIFF_POINTS[qItem.diff] || 0) }));
      setPCorrect((pc) => ({ ...pc, [qOwner]: pc[qOwner] + 1 }));
    } else {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play().catch(e => console.error("Ses çalınamadı:", e));
      setPWrong((pw) => ({ ...pw, [qOwner]: pw[qOwner] + 1 }));
    }

    setTimeout(() => {
      setShowQ(false);
      setFeedback(null);
      setQItem(null);
      setCaptured(null);
      finishTurnAndMaybeNextRound();
    }, 900);
  }

    if (!gameStarted && !showEnd) {
    return (
      <div className="fasulye-start-screen">
        <h1 className="fasulye-start-title">🎯 Fasulye Oyunu</h1>
        <div className="fasulye-start-form">
          <div className="fasulye-players-row">
            <div 
              className="fasulye-player-card"
              style={{ backgroundImage: `url(${kirmiziYastikImg})` }}
            >
              <label className="fasulye-input-label">Oyuncu 1</label>
              <input
                className="fasulye-input-field"
                placeholder="P1 ismi"
                value={playerNames[1]}
                onChange={(e) => setPlayerNames((pn) => ({ ...pn, 1: e.target.value }))}
              />
            </div>
            <div 
              className="fasulye-player-card"
              style={{ backgroundImage: `url(${maviYastikImg})` }}
            >
              <label className="fasulye-input-label">Oyuncu 2</label>
              <input
                className="fasulye-input-field"
                placeholder="P2 ismi"
                value={playerNames[2]}
                onChange={(e) => setPlayerNames((pn) => ({ ...pn, 2: e.target.value }))}
              />
            </div>
          </div>
          <button
            disabled={!playerNames[1] || !playerNames[2]}
            onClick={() => setGameStarted(true)}
            className="fasulye-start-button"
          >
            Oyuna Başla
          </button>
        </div>
      </div>
    );
  }

  if (showEnd) {
  const n1 = playerNames[1] || "P1";
  const n2 = playerNames[2] || "P2";

  let winnerMessage;
  if (pScore[1] > pScore[2]) {
    winnerMessage = `${n1} Kazandı!`;
  } else if (pScore[2] > pScore[1]) {
    winnerMessage = `${n2} Kazandı!`;
  } else {
    winnerMessage = "Berabere!";
  }

    return (
      <div className="fasulye-end-screen" style={{ backgroundImage: `url(${arkaplanImg})` }}>
        <h1 className="fasulye-end-title">🏁 Oyun Bitti</h1>
        <h2 className="fasulye-end-winner">{winnerMessage}</h2>
        <p className="fasulye-end-info">Toplam Tur: {round - 1}</p>
        <div className="fasulye-end-grid">
          <SummaryCard 
            playerIndex={1} 
            title={n1} 
            score={pScore[1]} 
            correct={pCorrect[1]} 
            wrong={pWrong[1]} 
            imageUrl={kirmiziYastikImg} 
          />
          <SummaryCard 
            playerIndex={2} 
            title={n2} 
            score={pScore[2]} 
            correct={pCorrect[2]} 
            wrong={pWrong[2]} 
            imageUrl={maviYastikImg} 
          />
        </div>
        <div className="fasulye-end-buttons">
          <button className="fasulye-end-back" onClick={() => setShowEnd(false)}>
            Geri Dön
          </button>
          <button
            className="fasulye-end-new"
            onClick={() => {
              setPScore({ 1: 0, 2: 0 });
              setPShots({ 1: 0, 2: 0 });
              setPCorrect({ 1: 0, 2: 0 });
              setPWrong({ 1: 0, 2: 0 });
              setRound(1);
              setTurnsInRound(0);
              setCurrentPlayer(1);
              setBall({ x: spawnLeft.x, y: spawnLeft.y - 200, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
              setShowEnd(false);
              setGameStarted(true);
            }}
          >
            Yeni Oyun
          </button>
        </div>
      </div>
    );
  }


  return (
  <div className="fasulye-game-wrapper">
    <div className="fasulye-game-screen">
      
      {/* Menu Button */}
      <button
        onClick={() => window.location.href = '/'}
        className="fasulye-menu-button"
      >
        🏠 Ana Menü
      </button>
      <div className="fasulye-header">
        <h1 className="fasulye-title">Fasulye Oyunu 🎯</h1>
        <div className="fasulye-controls">
          <div className="fasulye-turn-badge">
            <div>Tur: <b>{round}</b></div>
            <div>Sıradaki: <b>{playerNames[currentPlayer] || `P${currentPlayer}`}</b></div>
          </div>
          <HudPill label={playerNames[1] || "P1"} score={pScore[1]} shots={pShots[1]} correct={pCorrect[1]} wrong={pWrong[1]} color="red" />
          <HudPill label={playerNames[2] || "P2"} score={pScore[2]} shots={pShots[2]} correct={pCorrect[2]} wrong={pWrong[2]} color="blue" />
          <div className="fasulye-control-buttons">
            <button
              className="fasulye-reset-button"
              onClick={() => {
                setPScore({ 1: 0, 2: 0 });
                setPShots({ 1: 0, 2: 0 });
                setPCorrect({ 1: 0, 2: 0 });
                setPWrong({ 1: 0, 2: 0 });
                setCurrentPlayer(1);
                setRound(1);
                setTurnsInRound(0);
                setBall({ x: spawnLeft.x, y: spawnLeft.y - 200, r: 20, vx: 0, vy: 0, inFlight: false, owner: 1 });
              }}
            >
              Sıfırla
            </button>
            <button className="fasulye-end-button"
              onClick={() => {
                applauseAudioRef.current.currentTime = 0;
                applauseAudioRef.current.play().catch(e => console.error("Ses çalınamadı:", e));

                setShowEnd(true);
              }}>
              Oyunu Bitir
            </button>
          </div>
        </div>
      </div>

      <Legend />

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className="fasulye-game-container"
        style={{ backgroundImage: `url(${arkaplanImg})` }}
      >
        {drag.active && (
          <div className="fasulye-power-bar-wrapper">
            <div className="fasulye-power-label">
              Güç: {powerPct}%
            </div>
            <div className="fasulye-power-bar-outer">
              <div
                className="fasulye-power-bar-inner"
                style={{ width: `${powerPct}%` }}
              />
            </div>
          </div>
        )}

        {/* GÜNCELLENDİ: Yatay Gri Alan (Ekranın en altına kadar uzatıldı) */}
            <div
          className="fasulye-play-area"
          style={{
            left: 280, // Sol duvarın sağı (KORUNDU)
            right: 280, // Sağ duvarın solu (KORUNDU)
            top: (world.height / 2) - 150, // wallTopY (240)
            // YENİ YÜKSEKLİK: Ekranın en altına (world.height = 780) kadar uzatıldı.
            height: world.height - ((world.height / 2) - 150), // 780 - 240 = 540px
            background: "rgba(255,209,220, 0.8)" // Pembe alan
          }}
        />
        {/* GÜNCELLENDİ: Yatay Gri Alan (Ekranın en altına kadar uzatıldı) */}
        <div
          className="absolute z-10"
        // ... (style bloğu) ...
        />

        {/* === DUVAR GÖRSELLERİ === */}
        {/* Bu görseller, yukarıdaki fizik koduyla tam olarak hizalıdır */}
        <div
          className="fasulye-wall fasulye-wall-left"
          style={{
            left: 280 - 20, // 260
            width: 20,
            top: (world.height / 2) - 100 - 50, // 240
            height: (world.height) - ((world.height / 2) - 100 - 50) // 540
          }}
        />
        <div
          className="fasulye-wall fasulye-wall-right"
          style={{
            left: world.width - 280, // 1256
            width: 20,
            top: (world.height / 2) - 100 - 50, // 240
            height: (world.height) - ((world.height / 2) - 100 - 50) // 540
          }}
        />
        {layout.map((s) => (
          <SVGShape key={s.key} {...s} />
        ))}

        {/* Fırlatma alanları (Değişmedi) */}
        <div
          className="fasulye-launch-area fasulye-launch-left"
          style={{ 
            backgroundImage: `url(${doluKirmiziImg})`,
            top: spawnLeft.y, 
            width: spawnLeft.x + 200 
          }}
        />
       <div
          className="fasulye-launch-area fasulye-launch-right"
          style={{ 
            backgroundImage: `url(${doluMaviImg})`,
            top: spawnRight.y, 
            width: world.width - spawnRight.x + 200 
          }}
        />

        <div
          className="fasulye-ball"
          style={{ 
            backgroundImage: ball.owner === 1 ? `url(${kirmiziYastikImg})` : `url(${maviYastikImg})`,
            left: ball.x - ball.r, 
            top: ball.y - ball.r, 
            width: ball.r * 2, 
            height: ball.r * 2 
          }}
        />

        {drag.active && (
          <svg className="fasulye-trajectory" style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 40 }}>
            <line x1={drag.sx} y1={drag.sy} x2={drag.cx} y2={drag.cy} stroke="#1f2937" strokeDasharray="4 4" strokeWidth="2" />
            <circle cx={drag.sx} cy={drag.sy} r="6" fill="#1f2937" />
          </svg>
        )}

        {note && (
          <div className="fasulye-note">
            {note}
          </div>
        )}

        <TrajectoryPreview points={previewPoints} />
      </div>
        {showQ && qItem && captured && (
          <QuestionModal
            qItem={qItem}
            captured={captured}
            timeLeft={timeLeft}
            feedback={feedback}
            onAnswer={handleAnswer}
            timerAudioRef={timerAudioRef}
            correctAudioRef={correctAudioRef}
            wrongAudioRef={wrongAudioRef}
          />
        )}
    </div>
    </div>
  );
}

function HudPill({ label, score, shots, correct, wrong, color }) {
  const colorClass = color === 'red' ? 'fasulye-hud-red' : 'fasulye-hud-blue';
  
  return (
    <div className={`fasulye-hud-pill ${colorClass}`}>
      <div className="fasulye-hud-name">{label}</div>
      <div className="fasulye-hud-stats">
        <span>Skor: <b>{score}</b></span>
        <span>Atış: <b>{shots}</b></span>
        <span>✓ <b>{correct}</b></span>
        <span>✗ <b>{wrong}</b></span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="fasulye-legend">
      {SHAPES.map((s) => (
        <div key={s.key} className="fasulye-legend-item">
          <div 
            className="fasulye-legend-color" 
            style={{ 
              backgroundColor: s.color, 
              borderRadius: s.sides === 0 ? '9999px' : '0.25rem' 
            }} 
          />
          <div className="fasulye-legend-text">
            <span className="fasulye-legend-label">{s.label}</span>
            <span className="fasulye-legend-info">{s.diff} · {s.points} puan</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ title, score, correct, wrong, playerIndex, imageUrl }) {
  return (
    <div 
      className="fasulye-summary-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="fasulye-summary-title">{title}</div>
      <div className="fasulye-summary-stats">
        <div className="fasulye-summary-stat">Toplam Puan: <b>{score}</b></div>
        <div className="fasulye-summary-stat">Doğru: <b>{correct}</b></div>
        <div className="fasulye-summary-stat">Yanlış: <b>{wrong}</b></div>
        <div className="fasulye-summary-stat">Net: <b>{score}</b></div>
      </div>
    </div>
  );
}

function SVGShape({ x, y, w, h, color, label, rect, sides }) {
  const halfW = w / 2;
  const halfH = h / 2;
  const viewW = w;
  const viewH = h;
  const cx = viewW / 2;
  const cy = viewH / 2;

  const pointsArr = sides > 0 && !rect && sides !== 0
    ? buildRegularPolygonVertices(sides, cx, cy, Math.min(cx, cy) - 2)
    : null;
  const points = pointsArr ? pointsArr.map(p => `${p.x},${p.y}`).join(" ") : null;

  return (
    <div style={{ position: 'absolute', zIndex: 20, left: x - halfW, top: y - halfH, width: w, height: h }}>
      <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`} style={{ filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}>
        {sides === 0 && (
          <circle cx={cx} cy={cy} r={Math.min(cx, cy) - 2} fill={color} />
        )}
        {rect && (
          <rect x={2} y={2} width={viewW - 4} height={viewH - 4} rx={8} fill={color} />
        )}
        {points && (
          <polygon points={points} fill={color} />
        )}
      </svg>
      <div style={{ position: 'absolute', bottom: '-1.5rem', width: '100%', textAlign: 'center', fontSize: '0.625rem', fontWeight: 500, color: '#334155' }}>{label}</div>
    </div>
  );
}

function ShapePreview({ shape, size = 120 }) {
  const { color, rect, sides } = shape;
  const w = rect ? Math.round(size * 1.3) : size;
  const h = rect ? Math.round(size * 0.8) : size;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 4;

  const pointsArr = sides > 0 && !rect && sides !== 0
    ? buildRegularPolygonVertices(sides, cx, cy, r)
    : null;
  const points = pointsArr ? pointsArr.map(p => `${p.x},${p.y}`).join(" ") : null;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {sides === 0 && <circle cx={cx} cy={cy} r={r} fill={color} />}
      {rect && <rect x={4} y={4} width={w - 8} height={h - 8} rx={10} fill={color} />}
      {points && <polygon points={points} fill={color} />}
    </svg>
  );
}

// --- Geometri & fizik yardımcıları ---

function buildRegularPolygonVertices(sides, cx, cy, r) {
  const rot = -Math.PI / 2;
  const out = [];
  for (let i = 0; i < sides; i++) {
    const ang = rot + (i * 2 * Math.PI) / sides;
    out.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
  }
  return out;
}

function pointHitsShape(px, py, s) {
  if (s.sides === 0) {
    return (px - s.cx) ** 2 + (py - s.cy) ** 2 <= (s.outerR) ** 2;
  }
  if (s.rect) {
    const left = s.x - s.w / 2 + 2;
    const right = s.x + s.w / 2 - 2;
    const top = s.y - s.h / 2 + 2;
    const bottom = s.y + s.h / 2 - 2;
    return px >= left && px <= right && py >= top && py <= bottom;
  }
  const verts = buildRegularPolygonVertices(s.sides, s.cx, s.cy, s.outerR);
  return pointInPolygon(px, py, verts);
}

function pointInPolygon(x, y, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].x, yi = verts[i].y;
    const xj = verts[j].x, yj = verts[j].y;
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function predictTrajectory(x0, y0, vx0, vy0, g, W, H) {
  const pts = [];
  let t = 0;
  const dt = 0.04;

  // Topun etrafındaki görünmez kare sınırları
  const BBOX_SIZE = 300; // Karenin kenar uzunluğu (px)
  const minX = x0 - BBOX_SIZE / 2;
  const maxX = x0 + BBOX_SIZE / 2;
  const minY = y0 - BBOX_SIZE / 2;
  const maxY = y0 + BBOX_SIZE / 2;


  for (let i = 0; i < 10; i++) {
    const x = x0 + vx0 * t;
    const y = y0 + vy0 * t + 0.5 * g * t * t;

    // Hem canvas sınırlarını hem de görünmez kareyi kontrol et
    if (x < 0 || x > W || y < 0 || y > H + 40 || x < minX || x > maxX || y < minY || y > maxY) {
      break; // Sınırların dışına çıkınca çizmeyi bırak
    }

    pts.push({ x, y });
    t += dt;
  }
  return pts;
}
