package com.arjun.webdev.model;

import lombok.Data;

import java.util.Map;

@Data
public class Message {
    private String type;
    private Map<String, Object> features;

    public String getType(){
        return this.type;
    }

    public void setType(String type){
        this.type = type;
    }

    public Map<String, Object> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Object> features) {
        this.features = features;
    }
}

