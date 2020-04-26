export default (config, env) => {      
  if (env.production) {
    config.output.publicPath = '/starfields/';
  } else {
    config.output.publicPath = '/';
  }
}