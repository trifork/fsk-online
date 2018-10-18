package dk.sundhedsdatastyrelsen.fskrest.resource;

import org.glassfish.jersey.moxy.json.MoxyJsonConfig;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

// Register ContextResolver<MoxyJsonConfig> to override
// default behavior of marshaling/un-marshaling attributes

@Provider
public class MoxyConfigurationContextResolver implements ContextResolver<MoxyJsonConfig>
{

  private final MoxyJsonConfig config;

  public MoxyConfigurationContextResolver()
  {

      config = new MoxyJsonConfig()
//    		  .setFormattedOutput(true)
    		  .setValueWrapper("$")
    		  .setIncludeRoot(false);
  }

  @Override
  public MoxyJsonConfig getContext(Class<?> objectType)
  {
      return config;
  }
}
