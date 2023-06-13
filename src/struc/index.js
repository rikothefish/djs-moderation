const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    Routes,
    REST,
    PermissionsBitField,
  } = require("discord.js"),
  { readdirSync } = require("node:fs");

const config = require("@util/config"),
  initializeDB = require("@functions/mongodb");

const commands = [],
  dev_commands = [];

class Bot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
      allowedMentions: {
        repliedUser: false,
        parse: ["everyone", "roles", "users"],
      },
    });

    /*----- client collections -----*/
    this.slashCmd = new Collection();
    this.userCmd = new Collection();
    this.msgCmd = new Collection();
    this.events = new Collection();
    this.buttons = new Collection();
    this.menus = new Collection();
    this.modals = new Collection();

    /*----- client variables -----*/
    this.config = config;

    /*----- client functions -----*/
    this.loadSubCommand = async function (client, interaction) {
      try {
        return require(`${process.cwd()}/src/commands/subcommand/${
          interaction.commandName
        }/${interaction.options.getSubcommand()}`)(client, interaction).catch(
          (err) => {
            console.log(err.stack);
          }
        );
      } catch {
        return require(`${process.cwd()}/src/commands/subcommand/${
          interaction.commandName
        }/${interaction.options.getSubcommand()}`)(client, interaction).catch(
          (err) => {
            console.log(err.stack);
          }
        );
      }
    };
  }

  /*===== LOAD EVENTS =====*/
  async loadEvents() {
    readdirSync("./src/events/").forEach((folder) => {
      const eventFiles = readdirSync(`./src/events/${folder}`).filter((file) =>
        file.endsWith(".js")
      );
      for (const files of eventFiles) {
        const event = require(`@src/events/${folder}/${files}`);
        if (!event.name)
          return console.log(
            `[EVENT] - couldn't load "${files.split(".")[0]}"`
          );
        this.events.set(event.name, event);
        console.log(`[EVENT] - loaded "${event.name}"`);
        if (event.once) {
          this.once(event.name, (...args) => event.execute(this, ...args));
        } else {
          this.on(event.name, (...args) => event.execute(this, ...args));
        }
      }
    });
  }

  /*===== LOAD COMMANDS =====*/
  async loadCommands() {
    /*----- slash command -----*/
    readdirSync("./src/commands/slash").forEach((folder) => {
      const commandFiles = readdirSync(`./src/commands/slash/${folder}`).filter(
        (file) => file.endsWith(".js")
      );
      for (const files of commandFiles) {
        const command = require(`@src/commands/slash/${folder}/${files}`);
        if (!command) return;
        if (!command.name || !command.description || command.type !== 1)
          return console.log(
            `[SLASH] - couldn't load "${files.split(".")[0]}"`
          );
        this.slashCmd.set(command.name, command);
        if (
          (command.category && command.category === "owner") ||
          command.category === "dev"
        ) {
          dev_commands.push({
            name: command.name.toLowerCase(),
            description: command.description.toLowerCase(),
            type: command.type || 1,
            options: command.options ?? null,
            default_member_permissions: command.permissions
              ? PermissionsBitField.resolve(command.permissions).toString()
              : null,
          });
        } else {
          commands.push({
            name: command.name.toLowerCase(),
            description: command.description.toLowerCase(),
            type: command.type || 1,
            options: command.options ?? null,
            default_member_permissions: command.permissions
              ? PermissionsBitField.resolve(command.permissions).toString()
              : null,
          });
        }
        console.log(`[SLASH] - loaded "${command.name}"`);
      }
    });

    /*----- user command -----*/
    readdirSync("./src/commands/user").forEach((folder) => {
      const commandFiles = readdirSync(`./src/commands/user/${folder}`).filter(
        (file) => file.endsWith(".js")
      );
      for (const files of commandFiles) {
        const command = require(`@src/commands/user/${folder}/${files}`);
        if (!command) return;
        if (!command.name || command.type !== 2)
          return console.log(
            `[USER CMD] - couldn't load "${files.split(".")[0]}"`
          );
        this.userCmd.set(command.name, command);
        commands.push({
          name: command.name.toLowerCase(),
          type: command.type || 2,
        });
        console.log(`[USER CMD] - loaded "${files.split(".")[0]}"`);
      }
    });

    /*----- message command -----*/
    readdirSync("./src/commands/message").forEach((folder) => {
      const commandFiles = readdirSync(
        `./src/commands/message/${folder}`
      ).filter((file) => file.endsWith(".js"));
      for (const files of commandFiles) {
        const command = require(`@src/commands/message/${folder}/${files}`);
        if (!command) return;
        if (!command.name || command.type !== 3)
          return console.log(
            `[MESSAGE CMD] - couldn't load "${files.split(".")[0]}"`
          );
        this.msgCmd.set(command.name, command);
        commands.push({
          name: command.name,
          type: command.type || 3,
        });
        return console.log(`[MESSAGE CMD] - loaded "${files.split(".")[0]}"`);
      }
    });
  }

  /*===== LOAD COMPONENTS =====*/
  async loadComponents() {
    /*----- buttons -----*/
    readdirSync("./src/components/button/").forEach((folder) => {
      const buttonFiles = readdirSync(
        `./src/components/button/${folder}`
      ).filter((file) => file.endsWith(".js"));
      for (const file of buttonFiles) {
        const button = require(`@src/components/button/${folder}/${file}`);
        if (!button || !button.id) return;
        this.buttons.set(button.id, button);
      }
    });

    /*----- select menus -----*/
    readdirSync("./src/components/menu/").forEach((folder) => {
      const menuFiles = readdirSync(`./src/components/menu/${folder}`).filter(
        (file) => file.endsWith(".js")
      );
      for (const file of menuFiles) {
        const menu = require(`@src/menu/${folder}/${file}`);
        if (!menu || !menu.id) return;
        this.menus.set(menu.id, menu);
      }
    });

    /*----- modals -----*/
    readdirSync("./src/components/modal/").forEach((folder) => {
      const modalFiles = readdirSync(`./src/components/modal/${folder}`).filter(
        (file) => file.endsWith(".js")
      );
      for (const file of modalFiles) {
        const modal = require(`@src/components/modal/${folder}/${file}`);
        if (!modal || !modal.id) return;
        this.modals.set(modal.id, modal);
      }
    });
  }

  /*===== DEPLOY COMMANDS =====*/
  async registerCommands() {
    const rest = new REST({ version: "10" }).setToken(this.config.client.token);
    try {
      if (this.config.setting.devMode) {
        console.log("[CLIENT] - client on developer mode.");
        var data = await rest.put(
          Routes.applicationGuildCommands(
            this.config.client.id,
            this.config.server.id
          ),
          {
            body: [...commands, ...dev_commands],
          }
        );
      } else {
        console.log("[CLIENT] - client on global mode.");
        data = await rest.put(
          Routes.applicationCommands(this.config.client.id),
          {
            body: commands,
          }
        );
        await rest.put(
          Routes.applicationGuildCommands(
            this.config.client.id,
            this.config.server.id
          ),
          {
            body: dev_commands,
          }
        );
      }
      console.log(`[CLIENT] - ${data.length} application command/s reloaded.`);
    } catch (err) {
      console.log(err.stack);
    }
  }

  async start() {
    console.log("[CLIENT] - client is starting...");
    await initializeDB()
      .then(() => {
        console.log("[DATABASE] - connection established");
      })
      .catch((err) => {
        console.log(err.stack);
      });
    this.loadEvents();
    this.loadCommands();
    this.loadComponents();
    this.registerCommands();
    return await super
      .login(this.config.client.token)
      .catch((e) => console.log(e.stack));
  }
}

module.exports = Bot;
