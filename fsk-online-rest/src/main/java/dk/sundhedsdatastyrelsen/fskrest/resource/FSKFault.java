package dk.sundhedsdatastyrelsen.fskrest.resource;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "FSKFault")
public class FSKFault {

	private int code;
	private String message;

	public int getCode() {
		return code;
	}

	public void setCode(int value) {
		this.code = value;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String value) {
		this.message = value;
	}

}
