const { faker } = require("@faker-js/faker");
const Artist = require("../models/Artist");
const Artwork = require("../models/Artwork");
const { CATEGORY_DATA } = require("../constants/categoryData");
const Users = require("../models/Users");
const WonArtwork = require("../models/WonArtwork");
const WalletBuyer = require("../models/WalletBuyer");
const WalletArtist = require("../models/WalletArtist");
const BuyerProposal = require("../models/BuyerProposal");
const AcceptedProposal = require("../models/AcceptedProposal");
const CentralBank = require("../models/CentralBank");
const Reports = require("../models/Reports");

class TestFramework {
  getRandomText(len) {
    return faker.random.alphaNumeric(len);
  }

  getRandomBoolean() {
    return faker.datatype.boolean();
  }

  getRandomUserType() {
    return this.getRandomBoolean() ? UserType.CUSTOMER : UserType.ORGANIZER;
  }

  getRandomNumber(min, max) {
    return faker.datatype.number({ min: min, max: max });
  }

  getRandomWord() {
    return faker.random.word();
  }

  getRandomWords(len) {
    return faker.random.words(len);
  }

  getRandomCnic() {
    return faker.random.numeric(13);
  }

  getRandomAddress() {
    return faker.address.streetAddress(true);
  }

  getRandomEventStatus() {
    const keys = Object.values(EventStatus);

    return keys[Math.floor(Math.random() * keys.length)];
  }

  getRandomArrayElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomDate(start, end) {
    if (start && end) return faker.date.between(start, end);
    else return faker.date.recent();
  }

  getFutureDate(refDate) {
    return faker.date.future(undefined, refDate);
  }

  getPastDate(refDate) {
    return faker.date.past(undefined, refDate);
  }

  getRandomUserName() {
    return faker.internet.userName();
  }

  getRandomEmail() {
    return faker.internet.email();
  }

  getRandomPassword() {
    return faker.internet.password();
  }

  getRandomName() {
    return faker.person.fullName();
  }

  getRandomURL() {
    return faker.internet.url() + "/" + this.getRandomText(8) + ".jpeg";
  }

  getRandomCity() {
    return faker.location.city();
  }

  getRandomCategory() {
    const keys = Object.values(CATEGORY_DATA);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  getRandomArtworkStatus() {
    const randomIndex = Math.floor(Math.random() * 3);

    switch (randomIndex) {
      case 0:
        return "live";
      case 1:
        return "closed";
      case 2:
        return "upcoming";
    }
  }

  getRandomArtworkWonStatus() {
    const randomIndex = Math.floor(Math.random() * 3);

    switch (randomIndex) {
      case 0:
        return "claim";
      case 1:
        return "paid";
      case 2:
        return "pending";
    }
  }

  getRandomArtwork() {
    return faker.image.urlLoremFlickr({ category: "artwork" });
  }

  async getBidderList(buyerIds, len) {
    let bidderList = [];

    let buyer;

    while (true) {
      const buyerId = this.getRandomArrayElement(buyerIds);
      buyer = await Users.findById(buyerId);
      if (!buyer?.isAdmin) break;
    }

    for (let i = 0; i < len; i++) {
      const status = this.getRandomBoolean();
      const _bidderList = {
        bidderId: buyer._id,
        bidderFid: buyer.firebaseid,
        bidderName: buyer.name,
        bid: this.getRandomNumber(),
        autoBid: {
          status: status,
          maxAmount: status ? this.getRandomNumber() : 0,
          increament: status ? this.getRandomNumber() : 0,
        },
      };

      bidderList.push(_bidderList);
    }

    return bidderList;
  }

  getMaxBidder(bidderList) {
    let max = 0;
    let maxName = "";

    for (let i = 0; i < bidderList.length; i++) {
      const element = bidderList[i];
      if (element.bid > max) {
        max = element.bid;
        maxName = element.bidderName;
      }
    }

    return { max, maxName };
  }

  getRandomReportCategory() {
    const category = [
      "Fake Profile",
      "Scam",
      "Inappropriate Behavior",
      "Hateful Content",
      "Misleading",
      "Spam Messages",
    ];

    const cat = [];
    for (let i = 0; i < 4; i++) {
      cat.push(category[Math.floor(Math.random() * category.length)]);
    }

    return cat;
  }

  // --------------------------------------------------------- >

  async generateArtists(len) {
    try {
      let artists = [];

      for (let i = 0; i < len; i++) {
        const _artist = {
          name: this.getRandomName(),
          firebaseid: this.getRandomText(10) + this.getRandomWord(),
          email: this.getRandomText(6) + this.getRandomEmail(),
          phonenumber: this.getRandomNumber(),
          cnic: this.getRandomCnic(),
          fromGoogle: this.getRandomBoolean(),
        };
        artists.push(_artist);
      }

      const Ids = await Artist.insertMany(artists);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateUsers(len) {
    try {
      let users = [];

      for (let i = 0; i < len; i++) {
        const _user = {
          name: this.getRandomName(),
          firebaseid: this.getRandomText(10) + this.getRandomWord(),
          email: this.getRandomText(6) + this.getRandomEmail(),
          phonenumber: this.getRandomNumber(),
          cnic: this.getRandomCnic(),
          fromGoogle: this.getRandomBoolean(),
          isAdmin: this.getRandomBoolean(),
          location: this.getRandomCity(),
        };
        users.push(_user);
      }

      const Ids = await Users.insertMany(users);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateArtworks(len, artistIds) {
    try {
      let artworks = [];

      for (let i = 0; i < len; i++) {
        const startdate = this.getRandomDate();
        const _artwork = {
          artistId: this.getRandomArrayElement(artistIds),
          title: this.getRandomWord(),
          startdate: startdate,
          enddate: this.getFutureDate(startdate),
          baseprice: this.getRandomNumber(),
          category: this.getRandomCategory(),
          description: this.getRandomWords(100),
          images: this.getRandomArtwork(),
          status: this.getRandomArtworkStatus(),
        };
        artworks.push(_artwork);
      }

      const Ids = await Artwork.insertMany(artworks);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateArtistsRatings(len, artistIds, buyerIds) {
    try {
      for (let i = 0; i < len; i++) {
        const _artist = await Artist.findById(
          this.getRandomArrayElement(artistIds)
        );

        let ratings = [];
        for (let j = 0; j < 5; j++) {
          const buyer = await Users.findById(
            this.getRandomArrayElement(buyerIds)
          );

          const _rating = {
            ratedValue: this.getRandomNumber(1, 5),
            buyerId: buyer._id,
            description: this.getRandomWords(50),
            date: this.getRandomDate(),
          };
          ratings.push(_rating);
        }

        _artist.rating = ratings;

        await _artist.save();
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateArtworksBids(len, artworkIds, buyerIds) {
    try {
      for (let i = 0; i < artworkIds.length; i++) {
        let _artworkBids = await Artwork.findById(
          this.getRandomArrayElement(artworkIds)
        );

        const bidderList = await this.getBidderList(buyerIds, len);
        const maxBidder = this.getMaxBidder(bidderList);

        _artworkBids.currentbid = maxBidder.max;
        _artworkBids.currentbidder = maxBidder.maxName;
        _artworkBids.bidderList = bidderList;

        await _artworkBids.save();
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateWonArtworks(len, artworkIds, buyerIds) {
    try {
      let wonArtworks = [];
      let buyer;
      while (true) {
        buyer = await Users.findById(this.getRandomArrayElement(buyerIds));
        if (!buyer?.isAdmin) break;
      }

      for (let i = 0; i < len; i++) {
        const _wonArtwork = {
          artworkId: this.getRandomArrayElement(artworkIds),
          buyerId: buyer._id,
          winningAmount: this.getRandomNumber(),
          status: this.getRandomArtworkWonStatus(),
        };
        wonArtworks.push(_wonArtwork);
      }

      const Ids = await WonArtwork.insertMany(wonArtworks);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateWalletBuyer(len, buyerIds) {
    try {
      let walletBuyers = [];

      for (let i = 0; i < len; i++) {
        const _walletBuyers = {
          buyerId: this.getRandomArrayElement(buyerIds),
          Amount: this.getRandomNumber(),
        };
        walletBuyers.push(_walletBuyers);
      }

      const Ids = await WalletBuyer.insertMany(walletBuyers);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateWalletArtist(len, artistIds) {
    try {
      let walletArtists = [];

      for (let i = 0; i < len; i++) {
        const _walletArtists = {
          artistId: this.getRandomArrayElement(artistIds),
          Amount: this.getRandomNumber(),
        };
        walletArtists.push(_walletArtists);
      }

      const Ids = await WalletArtist.insertMany(walletArtists);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateBuyerProposal(len, buyerIds, artistIds) {
    try {
      let buyerProposals = [];

      for (let i = 0; i < len; i++) {
        const buyer = await Users.findById(
          this.getRandomArrayElement(buyerIds)
        );
        const date = this.getRandomDate();

        const artistProposals = [];
        for (let j = 0; j < 5; j++) {
          const artist = await Artist.findById(
            this.getRandomArrayElement(artistIds)
          );
          const _artistProposal = {
            artistId: artist._id,
            bidDate: this.getFutureDate(date),
            artistImage: artist.imageURL,
            artistName: artist.name,
            title: this.getRandomName(),
            description: this.getRandomWords(150),
            bidAmount: this.getRandomNumber(),
          };
          artistProposals.push(_artistProposal);
        }

        // await BuyerProposal.insertMany(buyerProposals);

        const _buyerProposal = {
          buyerInfo: {
            buyerId: buyer?._id,
            name: buyer.name,
            image: buyer.imageURL,
          },
          title: this.getRandomName(),
          description: this.getRandomText(150),
          dateCreated: this.getRandomDate(),
          expectedAmount: this.getRandomNumber(),
          artistProposals: artistProposals,
        };
        buyerProposals.push(_buyerProposal);
      }

      const Ids = await BuyerProposal.insertMany(buyerProposals);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateAcceptedProposal(len, buyerIds, artistIds, proposalIds) {
    try {
      let acceptedProposals = [];

      for (let i = 0; i < len; i++) {
        const buyer = await Users.findById(
          this.getRandomArrayElement(buyerIds)
        );
        const proposal = await BuyerProposal.findById(
          this.getRandomArrayElement(proposalIds)
        );
        const artist = await Artist.findById(
          this.getRandomArrayElement(artistIds)
        );
        // const date = this.getRandomDate();

        const _acceptedProposal = {
          buyerId: buyer._id,
          proposalId: proposal._id,
          paid: this.getRandomBoolean(),
          title: this.getRandomName(),
          description: this.getRandomWords(150),
          dateCreated: this.getRandomDate(),
          acceptedAmount: this.getRandomNumber(),
          artistInfo: {
            artistId: artist._id,
            artistName: artist.name,
          },
        };
        acceptedProposals.push(_acceptedProposal);
      }

      const Ids = await AcceptedProposal.insertMany(acceptedProposals);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateCentralBanks(len, buyerIds, artistIds, proposalIds) {
    try {
      let centralBanks = [];
      const bool = this.getRandomBoolean();

      for (let i = 0; i < len; i++) {
        const proposal = await BuyerProposal.findById(
          this.getRandomArrayElement(proposalIds)
        );
        const buyer = await Users.findById(
          this.getRandomArrayElement(buyerIds)
        );
        const artist = await Artist.findById(
          this.getRandomArrayElement(artistIds)
        );
        const _centralBank = {
          sender: {
            type: "Buyer",
            _id: bool ? buyer._id : artist._id,
            fid: this.getRandomText(30),
          },
          proposalId: proposal._id,
          amount: this.getRandomNumber(),
          receiver: {
            type: "Artist",
            _id: bool ? artist._id : buyer._id,
            fid: this.getRandomText(30),
          },
        };
        centralBanks.push(_centralBank);
      }

      const Ids = await CentralBank.insertMany(centralBanks);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async generateReports(len, buyerIds, artistIds) {
    try {
      let reports = [];
      const bool = this.getRandomBoolean();

      for (let i = 0; i < len; i++) {
        const buyer = await Users.findById(
          this.getRandomArrayElement(buyerIds)
        );
        const artist = await Artist.findById(
          this.getRandomArrayElement(artistIds)
        );
        const _report = {
          reportType: bool ? "artist" : "buyer",
          artist: {
            id: artist.id,
            name: artist.name,
          },
          buyer: {
            id: buyer.id,
            name: buyer.name,
          },
          description: this.getRandomWords(100),
          category: this.getRandomReportCategory(),
        };
        reports.push(_report);
      }

      const Ids = await Reports.insertMany(reports);

      //   this.saveValidators(Ids);

      return Ids;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = { TestFramework };
