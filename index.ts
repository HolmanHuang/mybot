import { Contact, Wechaty, Message, UrlLink, Friendship, log } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
import { EventLogger, QRCodeTerminal } from 'wechaty-plugin-contrib'
import { WechatyWeixinOpenAI, SentimentData } from 'wechaty-weixin-openai'

import { padplusToken, zipeibotIntro, zipeibotIntroUrl, contactAnswer} from './const'

// FIXME: change me to your weixin id
const bossId = 'ablockc'
const botId = 'ablockc'
const botIdorg = 'wxid_t909c6jrfsv522'

// FIXME: Please change this to your OpenAI token and key
const openAIToken = 'xxxxxxx'
const openAIEncodingAESKey = 'xxxx'

/**
 * Initialize a puppet and wechaty
 */
const puppet = new PuppetPadplus({
  token: padplusToken,
})

const bot = new Wechaty({
  name: 'wwc-agent',
  puppet,
})

/**
 * Function to get boss contact
 */
const getBoss = async () => {
  const contact = bot.Contact.load(bossId)
  await contact.sync()
  return contact
}

const mentionSelf = async (message: Message) : Promise<boolean> => {

    const mentionList = await message.mentionList()

    if(mentionList.some(contact => contact.id === botId)){
      return true;
    }

    if(mentionList.some(contact => contact.id === botIdorg)){
      return true;
    }

    return false;
}

/**
 * Preprocess message, if the message if sent from boss,
 * in room and mentioned the bot, will check for a list
 * of keyword, if anything matched, sent out prepared
 * materials
 * @param message received message
 */
const processCommonMaterial = async (message: Message) => {
  const room = message.room()
  const from = message.from()
  const isMentionSelf = await message.mentionSelf()
  //const isMentionSelf = mentionSelf(message)
  const text = message.text()

  //console.log `5processCommonMaterial from_id:${from.id},boss_ID:${bossId}, ${room}, ${isMentionSelf}, mlist ${message.mentionList()}, ${message.puppet.selfId()} `
  //log.verbose (`4processCommonMaterial from_id:${from.id},boss_ID:${bossId}, ${room}, ${isMentionSelf}`)

  if (room !== null && isMentionSelf) {
    if (/介绍一下子佩子�?.test(text)) {
      await room.say(zipeibotIntro)
      await room.say(new UrlLink(zipeibotIntroUrl))
      await room.say(contactAnswer)
      return true
    }
    /* 主人才可�?/
    if (from.id === bossId)
    {

    }

  }

  return false
}

/**
 * Enable basic plugins here
 *   EventLogger: print log for all events
 *   QRCodeTerminal: print a qrcode in the console for convenient scan
 */
bot.use(EventLogger())
bot.use(QRCodeTerminal({ small: true }))

/**
 * This hook function will be called when OpenAI does not match
 * any pre-set conversation
 * @param message received message
 */
const noAnswerHook = async (message: Message) => {
  const room = message.room()
  const from = message.from()
  if (!room) {
    return;
  }
  const members = await room.memberAll()
  const bossInRoom = members.find(m => m.id === bossId)
  if (bossInRoom) {
    await room.say`${bossInRoom}�?{from}问的问题我不知道，你帮我回答一下吧。`
  } else {
    const boss = await getBoss()
    await room.say`${from}，你的问题我不会回答，你可以联系我的老板`
    await room.say(boss)
  }
}

/**
 * This function will be called before the action executed. With answer will be sent
 * back and the sentiment data. So we can do customize logic here for some specific
 * case. If we want to take over the job of replying this message, we need to return
 * false in the function to prevent future actions.
 * @param message received message
 * @param answer this is the answer from the OpenAI, we didn't use it here, so use _ to replace it
 * @param sentiment this is the sentiment data returned from OpenAI
 */
const preAnswerHook = async (message: Message, _: any, sentiment: SentimentData) => {


  /*
  console.log `3.1 processCommonMaterial`
  log.verbose (`3.2 processCommonMaterial`)
  const isCommonMaterial = await processCommonMaterial(message);
  if (isCommonMaterial) {
    return false
  }
  */

  if (message.type() === Message.Type.Text) {
    if (!message.room()) {
      const text = message.text()
      if (/加群/.test(text)) {
        addContactToRoom(message.from()!, message)
        console.log(`add to group!`);
        return false
      }
    }
  }

  /*
  const hate = sentiment.hate
  const angry = sentiment.angry
  const score = (hate || 0) + (angry || 0)
  if (score > 0.9) {
    const boss = await getBoss()
    const from = message.from()
    const room = await bot.Room.create([boss, from])
    await new Promise(r => setTimeout(r, 3000))
    await room.say`${boss}，你帮帮我吧�?{from}和我聊天已经聊得不耐烦了`
    return false
  }
  */
}

 /**
 * 添加联系人入�? */
async function addContactToRoom(contact: Contact, message: Message) {
  // 这里直接填写你的群名称即�?
  const text = message.text()
  //var re = /加群/gi;
  //var newstr = str.replace(re, "");
  const roomname = text.replace('加群','')

  if (/汉服爱好�?.test(text)) {
    addAlias(contact,'爱好�?)
  } else if (/汉服宝妈/.test(text)) {
    addAlias(contact,'客户')
  } else if (/子佩子衿合作联盟/.test(text)) {
    addAlias(contact,'合作�?)
  } else if (/子佩子衿成员招募/.test(text)) {
    addAlias(contact,'成员')
  }

  //text.replace('加群','')
  const room = await bot.Room.find({ topic: roomname})
  if (room) {
    try {
      await room.add(contact)
    } catch (e) {
      console.error(e)
    }
  }
}


/**
 * Use wechaty-weixin-openai plugin here with given config
 */
bot.use(WechatyWeixinOpenAI({
  token: openAIToken,
  encodingAESKey: openAIEncodingAESKey,
  includeSentiment: true,
  noAnswerHook,
  preAnswerHook,
}))

/*
 * Add friendship automatically
 */
bot.on("friendship", async (friendship) => {
  // 如果是添加好友请�?  if (friendship.type() === Friendship.Type.Receive) {
    // 通过好友请求
    await friendship.accept();
    // 获取联系人信�?    const contact = friendship.contact();
    greeting(contact);
  }
});

/**
 * 对新增好友打招呼，提示加群消�? */
async function greeting(contact: Contact) {
  try {
    await contact.say(zipeibotIntro);
    await contact.say(new UrlLink(zipeibotIntroUrl));
    await contact.say(contactAnswer);
    await contact.say(`Hi，终于等到你！我是机器人小助手，回复「加群汉服爱好者」、「加群汉服宝妈」、「加群子佩子衿合作联盟」，「加群子佩子衿成员招募」即可加入相关进阶交流群哦。`);
    console.log(`greeting to ${contact.name()} successfully!`);
  } catch (e) {
    console.log(`failed to greeting to ${contact.name()}`);
  }
}

/**
 * 为好友添加别�?「前�?+ 名字�? */
async function addAlias(contact: Contact, role: String) {
  const name = contact.name();
  const newAlias = role +'-'+ ` ${name}`;
  try {
    await contact.alias(newAlias);
    console.log(`change ${contact.name()}'s alias ${newAlias} successfully!`);
  } catch (e) {
    console.log(`failed to change ${contact.name()} alias!`);
  }
}

bot.on('message', async (message: Message) => {
  //console.log `1.1processCommonMaterial`
  //log.verbose (`1.2processCommonMaterial `)
  const isCommonMaterial = await processCommonMaterial(message);
  if (isCommonMaterial) {
    return
  }
})

bot.start()
